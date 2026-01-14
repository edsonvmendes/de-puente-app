# 🚀 Instalação Rápida - DE PUENTE v2.0

## ⚡ Setup em 3 Minutos

### 1️⃣ Extrair e Instalar

```bash
# Extrair o ZIP
unzip de-puente-app.zip
cd de-puente-app

# Instalar dependências (IMPORTANTE!)
npm install
```

### 2️⃣ Configurar Supabase

Seu arquivo `.env.local` já está configurado com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dhtfrzabkxhhqauegrid.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

✅ Já está pronto!

### 3️⃣ Rodar

```bash
npm run dev
```

Abra: `http://localhost:3000`

---

## ✨ O Que Há de Novo (v2.0)

### 🎨 **Visual**
- ✅ Dark Mode completo (toggle no header)
- ✅ Toast notifications elegantes
- ✅ Loading skeletons animados
- ✅ Animações suaves (Framer Motion)
- ✅ Fins de semana com cor diferente
- ✅ Indicador de "hoje" destacado
- ✅ Avatares coloridos com iniciais

### 🔧 **Funcionalidades**
- ✅ Header novo com logout
- ✅ Modal de confirmação ao deletar
- ✅ Empty states quando sem dados
- ✅ Theme persistente (localStorage)
- ✅ Hover states no calendário

### 📦 **Novas Dependências**
- `react-hot-toast` - Toast notifications
- `framer-motion` - Animações suaves

---

## 🎯 Testando as Novas Funcionalidades

### **Dark Mode** 🌙
1. Clique no ícone de lua/sol no header
2. O tema muda instantaneamente
3. Fica salvo mesmo depois de fechar

### **Toast Notifications** 💬
1. Crie uma ausência
2. Veja a notificação "¡Ausencia creada!"
3. Faça logout - veja "Sesión cerrada"

### **Skeleton Loading** ⏳
1. Recarregue a página
2. Veja os placeholders animados
3. Transição suave para o conteúdo

### **Confirmação de Delete** ⚠️
1. Clique em uma ausência
2. Clique em "Eliminar"
3. Veja o modal de confirmação elegante

### **Empty States** 📭
1. Sem ausências? Veja a mensagem bonita
2. Botão para criar primeira ausência

---

## 🎨 Personalizando Cores

Edite `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#3b82f6', // Cor principal (azul)
  },
}
```

---

## 🐛 Troubleshooting

### ❌ "Module not found: react-hot-toast"
```bash
npm install
```

### ❌ Dark mode não funciona
```bash
rm -rf .next
npm run dev
```

### ❌ Toasts não aparecem
Verifique se `<ToastProvider />` está em `app/layout.tsx`

---

## 📚 Documentação

- `UX_UI_IMPROVEMENTS.md` - Todas as melhorias implementadas
- `README.md` - Guia completo
- `DEPLOYMENT.md` - Como fazer deploy

---

## 🚀 Próximo Passo: DEPLOY!

Depois de testar localmente, vamos fazer deploy!

**Opciones:**
1. Vercel (recomendado) - Grátis e automático
2. VPS próprio - Mais controle

Me avisa quando estiver tudo funcionando localmente! 🎉
