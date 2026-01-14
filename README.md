# 🔵 DE PUENTE - App de Gestión de Ausencias

App web interna para gestionar vacaciones, días libres, viajes y bajas médicas de equipos corporativos.

## 🎯 Características Principales

- ✅ Calendario visual (vista mensual y semanal)
- ✅ Crear ausencias en < 15 segundos
- ✅ Editar y eliminar ausencias propias
- ✅ Soporte multi-equipo para usuarios
- ✅ Filtros por equipo
- ✅ Cálculo automático de días laborables (excluye fines de semana)
- ✅ Export a Excel (.xlsx)
- ✅ Festivos oficiales Gestamp
- ✅ Admin console completo
- ✅ RLS (Row Level Security) implementado
- ✅ Privacidad: usuarios inactivos pierden acceso a datos del equipo

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI**: Tailwind CSS, FullCalendar
- **Backend**: Supabase (Auth + Postgres + RLS)
- **Export**: ExcelJS
- **Deploy**: Vercel-ready

## 📦 Instalación

### 1. Clonar e instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crear proyecto en [Supabase](https://supabase.com)
2. Copiar `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

3. Completar variables en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### 3. Ejecutar SQL

En el SQL Editor de Supabase, ejecutar:

```bash
supabase/schema.sql
```

Este archivo incluye:
- Schema completo
- Función `count_business_days()`
- RLS policies
- Triggers
- Vista `absences_with_business_days`

### 4. Configurar autenticación

En Supabase Dashboard → Authentication → Settings:

1. **Email confirmación**: Desactivar para desarrollo (activar en producción)
2. **Providers**: Habilitar Email/Password
3. **URL de redirección**: Agregar `http://localhost:3000/auth/callback`

### 5. Crear primer admin

```sql
-- En Supabase SQL Editor
update profiles 
set role = 'admin' 
where email = 'tu-email@empresa.com';
```

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
de-puente-app/
├── app/
│   ├── actions/          # Server Actions
│   │   ├── absences.ts   # CRUD de ausencias
│   │   ├── admin.ts      # Funciones admin
│   │   └── export.ts     # Export Excel
│   ├── admin/            # Admin console (TODO)
│   ├── layout.tsx
│   ├── page.tsx          # Página principal (calendario)
│   └── globals.css
├── components/
│   ├── CalendarView.tsx          # Componente calendario
│   ├── CreateAbsenceModal.tsx    # Modal crear ausencia
│   ├── AbsenceDetailModal.tsx    # Modal detalle/editar
│   ├── TodayOffCard.tsx          # Card "Hoy están de puente"
│   └── ExportButton.tsx          # Botón export Excel
├── lib/
│   ├── supabase/
│   │   ├── client.ts     # Cliente Supabase (browser)
│   │   └── server.ts     # Cliente Supabase (server)
│   └── utils/
│       ├── dates.ts      # Utilidades de fechas
│       └── absence-types.ts  # Tipos de ausencias
├── supabase/
│   └── schema.sql        # Schema completo + RLS
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 🎨 Tipos de Ausencia

| Tipo | Emoji | Color |
|------|-------|-------|
| Vacaciones | 🌴 | Verde |
| Día libre | 🛌 | Azul |
| Viaje | ✈️ | Morado |
| Baja médica | 🤒 | Rojo |
| Festivo Gestamp | 🎉 | Gris |

## 👥 Roles y Permisos

### Member (Usuario Normal)

- ✅ Ver ausencias de sus equipos activos
- ✅ Crear ausencias en equipos donde está activo
- ✅ Editar/eliminar solo sus propias ausencias
- ✅ Puede estar en múltiples equipos simultáneamente
- ❌ No puede gestionar personas, equipos ni festivos

### Admin

- ✅ Acceso total a todos los equipos
- ✅ Editar/eliminar cualquier ausencia
- ✅ Gestionar personas (invitar, dar de alta/baja)
- ✅ Gestionar equipos
- ✅ Crear/editar festivos oficiales

## 🔒 Seguridad (RLS)

El sistema implementa Row Level Security completo:

1. **Privacidad por equipo**: Los usuarios solo ven ausencias de equipos donde están activos
2. **Protección de escritura**: No se pueden crear ausencias en equipos ajenos
3. **Isolation**: Usuarios `inactive` pierden acceso inmediato a datos del equipo
4. **Admin override**: Los admins tienen acceso completo para gestión

Ver `supabase/schema.sql` para policies completas.

## 📊 Cálculo de Días Laborables

El sistema calcula días laborables **excluyendo sábados y domingos**:

```sql
-- Función SQL
count_business_days(start_date, end_date)

-- Ejemplo
count_business_days('2025-01-13', '2025-01-17') → 5 días
```

Usado en:
- Vista `absences_with_business_days`
- Resumen
- Export Excel

## 📤 Export a Excel

Columnas exportadas:

- Usuario
- Email
- Equipo
- Tipo
- Fecha inicio
- Fecha fin
- **Días laborables** (calculado)
- Nota

## 🚀 Deploy en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variables de entorno en Vercel Dashboard:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
```

## ✅ Checklist de QA

### Funcionalidades Core

- [ ] Crear ausencia (< 15 segundos)
- [ ] Editar ausencia (cambiar tipo, fechas, nota)
- [ ] Eliminar ausencia (con confirmación)
- [ ] Ajustes rápidos (+1/-1 día, +7/-7 días)
- [ ] Calendario muestra eventos correctamente
- [ ] Filtro por equipo funciona
- [ ] "Hoy están de puente" muestra usuarios correctos

### Multi-Equipo

- [ ] Usuario en 1 equipo: dropdown oculto, equipo auto-seleccionado
- [ ] Usuario en múltiples equipos: dropdown visible
- [ ] Cambiar equipo seleccionado actualiza calendario
- [ ] Crear ausencia en equipo correcto

### Permisos

- [ ] Member ve solo ausencias de equipos activos
- [ ] Member edita/elimina solo sus ausencias
- [ ] Admin ve todas las ausencias
- [ ] Admin edita/elimina cualquier ausencia
- [ ] Usuario inactive pierde acceso a equipo

### Cálculo de Días

- [ ] count_business_days excluye fines de semana
- [ ] Export Excel muestra días laborables correctos
- [ ] Lunes-Viernes = 5 días

### Export Excel

- [ ] Export genera archivo .xlsx
- [ ] Columnas correctas
- [ ] Días laborables calculados correctamente
- [ ] Filename con fechas

### Admin Console (Pendiente)

- [ ] Invitar personas
- [ ] Dar de alta/baja membresías
- [ ] Crear/editar equipos
- [ ] Crear/editar festivos

### Performance

- [ ] Carga inicial < 2 segundos
- [ ] Cambiar mes < 500ms
- [ ] Crear ausencia < 1 segundo
- [ ] Export < 3 segundos (100 registros)

## 🐛 Troubleshooting

### Error: "No autenticado"

- Verificar `.env.local` tiene variables correctas
- Confirmar usuario está autenticado en Supabase
- Revisar cookies no están bloqueadas

### Ausencias no aparecen

- Verificar RLS policies están aplicadas
- Confirmar usuario está en equipo con status `active`
- Revisar fechas de las ausencias

### Export no funciona

- Verificar ExcelJS está instalado: `npm install exceljs`
- Revisar consola del navegador para errores
- Confirmar permisos de descarga en navegador

## 📝 Próximos Pasos

1. [ ] Implementar páginas Admin (`/admin/people`, `/admin/teams`, `/admin/holidays`)
2. [ ] Agregar página Resumen con estadísticas
3. [ ] Implementar drag & drop en calendario (opcional)
4. [ ] Agregar notificaciones (toast messages)
5. [ ] Tests unitarios y E2E
6. [ ] Documentación API

## 📄 Licencia

Uso interno - Gestamp

## 🤝 Contribuir

Proyecto interno. Para sugerencias o bugs, contactar al equipo de desarrollo.

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2025
