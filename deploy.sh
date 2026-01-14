#!/bin/bash

echo "🚀 DE PUENTE - Script de Deploy"
echo "================================"
echo ""

# Verificar se está na pasta correta
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script dentro da pasta de-puente-app"
    exit 1
fi

# Criar .gitignore
echo "📝 Criando .gitignore..."
cat > .gitignore << EOF
# Dependencies
node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
EOF

echo "✅ .gitignore criado"
echo ""

# Inicializar Git
if [ ! -d ".git" ]; then
    echo "🔧 Inicializando Git..."
    git init
    echo "✅ Git inicializado"
else
    echo "✅ Git já inicializado"
fi
echo ""

# Verificar se já tem remote
if git remote | grep -q origin; then
    echo "⚠️  Remote 'origin' já existe. Removendo..."
    git remote remove origin
fi

# Adicionar remote
echo "🔗 Adicionando remote do GitHub..."
git remote add origin https://github.com/edsonvmendes/de-puente-app.git
echo "✅ Remote adicionado: https://github.com/edsonvmendes/de-puente-app.git"
echo ""

# Adicionar arquivos
echo "📦 Adicionando arquivos ao Git..."
git add .
echo "✅ Arquivos adicionados"
echo ""

# Commit
echo "💾 Criando commit..."
git commit -m "Initial commit - DE PUENTE App 🌴

Features:
- ✅ Gestão de ausências (vacaciones, día libre, viaje, baja médica)
- ✅ Admin Console
- ✅ Exportação para Excel
- ✅ Resumen de ausências
- ✅ Suporte PT/EN
- ✅ Calendário interativo
- ✅ Toast notifications
- ✅ Animações suaves"

echo "✅ Commit criado"
echo ""

# Verificar branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "master")
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "🔀 Renomeando branch para 'main'..."
    git branch -M main
fi
echo ""

# Push
echo "🚀 Fazendo push para GitHub..."
echo "⚠️  Se for a primeira vez, você precisará fazer login no GitHub"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ✅ ✅ SUCESSO! ✅ ✅ ✅"
    echo ""
    echo "🎉 Código enviado para GitHub!"
    echo "📦 Repositório: https://github.com/edsonvmendes/de-puente-app"
    echo ""
    echo "📋 PRÓXIMOS PASSOS:"
    echo "1. Vá em https://vercel.com/new"
    echo "2. Faça login com GitHub"
    echo "3. Selecione o repositório 'de-puente-app'"
    echo "4. Adicione as Environment Variables:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo "5. Clique em 'Deploy'"
    echo ""
    echo "🌐 Seu app estará online em 2-3 minutos!"
    echo ""
else
    echo ""
    echo "❌ Erro ao fazer push"
    echo ""
    echo "📋 SOLUÇÕES:"
    echo "1. Crie o repositório primeiro em: https://github.com/new"
    echo "   Nome: de-puente-app"
    echo "   Deixe Private (ou Public)"
    echo "   NÃO adicione README, .gitignore ou license"
    echo ""
    echo "2. Faça login no Git:"
    echo "   git config --global user.email 'edsonvmendes@gmail.com'"
    echo "   git config --global user.name 'Edson Mendes'"
    echo ""
    echo "3. Execute este script novamente"
    echo ""
fi
