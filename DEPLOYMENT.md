# 🚀 DEPLOYMENT GUIDE - DE PUENTE

## Pre-requisitos

- [ ] Cuenta en Supabase
- [ ] Cuenta en Vercel (o servidor Node.js)
- [ ] Node.js 18+ instalado localmente

---

## 1. SETUP SUPABASE

### 1.1 Crear Proyecto

1. Ir a https://supabase.com
2. Click "New Project"
3. Completar:
   - Name: `de-puente-prod`
   - Database Password: (generar seguro)
   - Region: seleccionar más cercana
4. Esperar provisioning (~2 minutos)

### 1.2 Ejecutar SQL

1. Ir a SQL Editor
2. Click "New Query"
3. Copiar y pegar contenido de `supabase/schema.sql`
4. Click "Run"
5. Verificar: todas las tablas creadas sin errores

### 1.3 Configurar Authentication

1. Ir a Authentication → Settings
2. **Email confirmación**:
   - Development: OFF
   - Production: ON (recomendado)
3. **Providers**: Habilitar Email/Password
4. **URL de redirección**:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://tu-dominio.com/auth/callback`

### 1.4 Obtener Credenciales

1. Ir a Settings → API
2. Copiar:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Ir a Settings → API → Service role
4. Click "Reveal" y copiar:
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **IMPORTANTE**: Service role key es super-secreta. Solo en servidor.

---

## 2. CREAR PRIMER ADMIN

```sql
-- En Supabase SQL Editor

-- 1. Crear usuario manualmente (o registrarse en la app)
-- Si ya existe, solo actualizar rol

-- 2. Dar rol admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@tuempresa.com';

-- 3. Crear equipo inicial
INSERT INTO teams (name) 
VALUES ('Equipo General');

-- 4. Agregar admin al equipo
INSERT INTO team_memberships (profile_id, team_id, status)
SELECT 
  p.id,
  t.id,
  'active'
FROM profiles p, teams t
WHERE p.email = 'admin@tuempresa.com'
AND t.name = 'Equipo General';
```

---

## 3. DEPLOYMENT EN VERCEL

### 3.1 Preparar Proyecto

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy desde proyecto
cd de-puente-app
vercel
```

### 3.2 Configurar Variables de Entorno

En Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ Aplicar a: Production, Preview, Development

### 3.3 Re-deploy

```bash
vercel --prod
```

### 3.4 Configurar Dominio (Opcional)

1. Vercel Dashboard → Settings → Domains
2. Agregar dominio custom
3. Configurar DNS según instrucciones

---

## 4. DEPLOYMENT ALTERNATIVO (VPS/Cloud)

### 4.1 Preparar Servidor

```bash
# SSH al servidor
ssh user@tu-servidor.com

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2
```

### 4.2 Clonar y Configurar

```bash
# Clonar repositorio
git clone https://tu-repo.git
cd de-puente-app

# Instalar dependencias
npm install

# Configurar .env
cp .env.example .env
nano .env
# (completar variables)

# Build
npm run build
```

### 4.3 Iniciar con PM2

```bash
# Iniciar
pm2 start npm --name "de-puente" -- start

# Guardar configuración
pm2 save

# Auto-start en reboot
pm2 startup
```

### 4.4 Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activar sitio
sudo ln -s /etc/nginx/sites-available/de-puente /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL con Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

---

## 5. POST-DEPLOYMENT CHECKLIST

### 5.1 Funcionalidad

- [ ] App carga correctamente
- [ ] Login funciona
- [ ] Crear ausencia funciona
- [ ] Calendario muestra datos
- [ ] Export Excel funciona
- [ ] Admin console accesible (si implementado)

### 5.2 Performance

- [ ] Lighthouse Score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s

### 5.3 Seguridad

- [ ] HTTPS habilitado
- [ ] Variables de entorno correctas
- [ ] Service role key NO expuesta al cliente
- [ ] RLS policies activas
- [ ] CORS configurado correctamente

### 5.4 Monitoreo

- [ ] Configurar Sentry/error tracking
- [ ] Configurar analytics (opcional)
- [ ] Configurar alertas de uptime

---

## 6. MANTENIMIENTO

### 6.1 Backups (Supabase)

Supabase hace backups automáticos en plan Pro:
- Daily backups: últimos 7 días
- Point-in-time recovery: últimas 24 horas

Para backup manual:
1. Ir a Settings → Database
2. Click "Create backup"

### 6.2 Updates

```bash
# Pull cambios
git pull origin main

# Instalar nuevas dependencias
npm install

# Build
npm run build

# Restart (Vercel auto, PM2 manual)
pm2 restart de-puente
```

### 6.3 Migraciones SQL

Para cambios en schema:
1. Crear archivo SQL con cambios
2. Ejecutar en Supabase SQL Editor
3. Documentar en `supabase/migrations/`

---

## 7. TROUBLESHOOTING COMÚN

### "Error connecting to Supabase"

- Verificar URL y keys correctas
- Verificar red no bloquea supabase.co
- Revisar CORS en Supabase settings

### "RLS prevents access"

- Verificar policies están activas
- Verificar usuario autenticado
- Revisar membership status = 'active'

### "Build fails"

- Limpiar cache: `rm -rf .next node_modules`
- Reinstalar: `npm install`
- Verificar Node.js version >= 18

### "Export Excel no funciona"

- Verificar ExcelJS instalado
- Revisar permisos de descarga en navegador
- Verificar CORS si API separada

---

## 8. CONTACTO SOPORTE

Para problemas técnicos:
- Email: dev@tuempresa.com
- Slack: #de-puente-support

---

**Última actualización**: Enero 2025
