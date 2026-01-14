# 🚀 Guia de Deploy - DE PUENTE

Seu usuário GitHub: **edsonvmendes**

## ⚡ DEPLOY RÁPIDO (3 Passos)

### 1️⃣ Criar Repositório no GitHub
- Vá em: https://github.com/new
- Nome: `de-puente-app`
- Private ou Public
- NÃO adicione nada (README, .gitignore, etc)
- Clique "Create repository"

### 2️⃣ Executar Script
```bash
bash deploy.sh
```

### 3️⃣ Deploy na Vercel
- Vá em: https://vercel.com/new
- Login com GitHub
- Selecione "de-puente-app"
- Adicione 3 Environment Variables (ver abaixo)
- Clique "Deploy"

## 🔑 Environment Variables (Copie e Cole)

```
NEXT_PUBLIC_SUPABASE_URL
https://dhtfrzabkxhhqauegrid.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY  
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodGZyemFia3hoaHFhdWVncmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMDY2MDQsImV4cCI6MjA4Mzg4MjYwNH0.64CsHxPWHX2_Z9CJw-tZ042MmytnVDWIwtsoch9Sf0Q

SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodGZyemFia3hoaHFhdWVncmlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMwNjYwNCwiZXhwIjoyMDgzODgyNjA0fQ.0R8F3IaZeIjyYhfHR05siqVJFJ9vkXdi7ybvMmBrG_0
```

## ✅ Pronto!

Seu app estará online em 2-3 minutos em:
`https://de-puente-app.vercel.app`
