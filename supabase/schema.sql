-- ============================================
-- DE PUENTE - SCHEMA COMPLETO
-- ============================================

-- Extensiones necesarias
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLAS PRINCIPALES
-- ============================================

-- Equipos
create table teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamptz default now()
);

-- Perfiles de usuario (extiende auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  avatar_url text,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Membresías en equipos
create table team_memberships (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'inactive')),
  joined_at timestamptz default now(),
  left_at timestamptz,
  unique(profile_id, team_id)
);

-- Ausencias
create table absences (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  type text not null check (type in ('vacaciones', 'dia_libre', 'viaje', 'baja_medica')),
  start_date date not null,
  end_date date not null,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint valid_dates check (start_date <= end_date)
);

-- Festivos oficiales
create table holidays (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  scope text not null default 'global' check (scope in ('global')),
  start_date date not null,
  end_date date not null,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  constraint valid_holiday_dates check (start_date <= end_date)
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

create index idx_absences_profile on absences(profile_id);
create index idx_absences_team on absences(team_id);
create index idx_absences_dates on absences(start_date, end_date);
create index idx_team_memberships_profile on team_memberships(profile_id);
create index idx_team_memberships_team on team_memberships(team_id);
create index idx_team_memberships_status on team_memberships(status);

-- ============================================
-- FUNCIONES
-- ============================================

-- Función: contar días laborables (excluye sábados y domingos)
create or replace function count_business_days(
  start_date date,
  end_date date
)
returns integer
language plpgsql
immutable
as $$
declare
  business_days integer;
begin
  select count(*)::integer into business_days
  from generate_series(start_date, end_date, '1 day'::interval) as d
  where extract(dow from d) not in (0, 6); -- 0=domingo, 6=sábado
  
  return business_days;
end;
$$;

-- Función: actualizar updated_at automáticamente
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Función: crear profile automáticamente al registrarse
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: actualizar updated_at en profiles
create trigger profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at();

-- Trigger: actualizar updated_at en absences
create trigger absences_updated_at
  before update on absences
  for each row
  execute function update_updated_at();

-- Trigger: crear profile automáticamente al registrarse
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();

-- ============================================
-- VISTA: AUSENCIAS CON DÍAS LABORABLES
-- ============================================

create or replace view absences_with_business_days as
select
  a.*,
  p.full_name,
  p.email,
  t.name as team_name,
  count_business_days(a.start_date, a.end_date) as business_days
from absences a
join profiles p on p.id = a.profile_id
join teams t on t.id = a.team_id;

-- Habilitar RLS en la vista
alter view absences_with_business_days set (security_invoker = true);

-- ============================================
-- VISTA: AUSENCIAS EN TODOS LOS EQUIPOS DEL USUARIO
-- ============================================

-- Nueva view: ausencias aparecen en TODOS los equipos activos del usuario
-- Cada ausencia se multiplica por los equipos donde el usuario está activo
-- Ejemplo: 1 ausencia + 3 equipos = 3 registros en la view
create or replace view absences_all_teams_with_business_days as
select
  a.id,
  a.profile_id,
  tm.team_id,  -- team_id viene del membership, no de la ausencia
  a.type,
  a.start_date,
  a.end_date,
  a.note,
  a.created_at,
  a.updated_at,
  p.full_name,
  p.email,
  t.name as team_name,
  count_business_days(a.start_date, a.end_date) as business_days
from absences a
join profiles p on p.id = a.profile_id
join team_memberships tm on tm.profile_id = a.profile_id and tm.status = 'active'
join teams t on t.id = tm.team_id;

-- Habilitar RLS en la vista
alter view absences_all_teams_with_business_days set (security_invoker = true);

comment on view absences_all_teams_with_business_days is 
'Ausencias del usuario en TODOS sus equipos activos. 
Cada ausencia aparece multiplicada para cada equipo donde el usuario está activo.
Garantiza que la ausencia sea visible en todos los calendarios de los equipos del usuario.';


-- ============================================
-- HABILITAR RLS
-- ============================================

alter table profiles enable row level security;
alter table teams enable row level security;
alter table team_memberships enable row level security;
alter table absences enable row level security;
alter table holidays enable row level security;

-- ============================================
-- RLS POLICIES: PROFILES
-- ============================================

-- Todos pueden ver perfiles (para nombres en calendario)
create policy "Perfiles visibles para todos"
  on profiles for select
  using (true);

-- Solo admins gestionan perfiles
create policy "Admins gestionan perfiles"
  on profiles for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Usuarios actualizan su propio perfil
create policy "Usuarios actualizan su perfil"
  on profiles for update
  using (id = auth.uid());

-- ============================================
-- RLS POLICIES: TEAMS
-- ============================================

-- Todos pueden ver equipos
create policy "Equipos visibles para todos"
  on teams for select
  using (true);

-- Solo admins gestionan equipos
create policy "Admins gestionan equipos"
  on teams for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES: TEAM_MEMBERSHIPS
-- ============================================

-- Ver membresías propias o todas si admin
create policy "Ver membresías permitidas"
  on team_memberships for select
  using (
    profile_id = auth.uid()
    or exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Solo admins gestionan membresías
create policy "Admins gestionan membresías"
  on team_memberships for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES: ABSENCES (CRÍTICO)
-- ============================================

-- Ver ausencias de equipos activos o todas si admin
create policy "Ver ausencias de mis equipos activos"
  on absences for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
    or exists (
      select 1 from team_memberships
      where profile_id = auth.uid()
        and team_id = absences.team_id
        and status = 'active'
    )
  );

-- Crear ausencias solo en equipos activos
create policy "Crear ausencias en equipos activos"
  on absences for insert
  with check (
    profile_id = auth.uid()
    and exists (
      select 1 from team_memberships
      where profile_id = auth.uid()
        and team_id = absences.team_id
        and status = 'active'
    )
  );

-- Actualizar solo propias ausencias o todas si admin
create policy "Actualizar propias ausencias"
  on absences for update
  using (
    profile_id = auth.uid()
    or exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Eliminar solo propias ausencias o todas si admin
create policy "Eliminar propias ausencias"
  on absences for delete
  using (
    profile_id = auth.uid()
    or exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES: HOLIDAYS
-- ============================================

-- Todos pueden ver festivos
create policy "Festivos visibles para todos"
  on holidays for select
  using (true);

-- Solo admins gestionan festivos
create policy "Admins gestionan festivos"
  on holidays for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- DATOS INICIALES (OPCIONAL)
-- ============================================

-- Crear equipo por defecto
insert into teams (name) 
values ('Equipo General')
on conflict do nothing;

-- ============================================
-- COMENTARIOS
-- ============================================

comment on table profiles is 'Perfiles de usuario extendidos de auth.users';
comment on table teams is 'Equipos de trabajo';
comment on table team_memberships is 'Relación usuarios-equipos con estados active/inactive';
comment on table absences is 'Ausencias de usuarios (vacaciones, días libres, viajes, bajas)';
comment on table holidays is 'Festivos oficiales de Gestamp';
comment on function count_business_days is 'Cuenta días laborables excluyendo fines de semana';
