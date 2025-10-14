# 🧠 Minha Rotina (PWA)

Um **aplicativo PWA** criado com **Next.js 14**, desenvolvido para ajudar pessoas com **TDAH** a organizarem suas rotinas, tarefas, estudos, finanças e foco diário.

Funciona **100% offline**, salva os dados **localmente** e pode ser **instalado como app** no celular ou computador.

---

## ✨ Recursos principais

### ✅ Tarefas

- Criação de tarefas com **prioridade**, **área**, **data de vencimento** e **recorrência** (Nenhuma, Diária, Semanal).
- Filtros por “Hoje”, “Pendentes” e “Concluídas”.
- Pesquisa e ordenação por data, prioridade ou criação.
- Notificação automática de tarefas do dia (quando permitido).
- Ao concluir uma tarefa recorrente, a próxima é gerada automaticamente.

### ⏱️ Foco (Pomodoro)

- Ciclos personalizáveis de foco e pausas (curta/longa).
- Exibe tempo restante e envia **notificações** ao fim de cada ciclo.
- Configurações salvas automaticamente.

### 📚 Estudos

- Cadastro de tópicos de estudo.
- Registro de sessões com tempo e anotações.
- Histórico salvo localmente para acompanhar seu progresso.

### 💰 Finanças

- Lançamentos de **receitas** e **despesas** com data, categoria e descrição.
- Cálculo automático de **saldo**, **total de receitas** e **total de despesas**.
- Filtro por categoria.

### 📝 Notas rápidas

- Bloco de anotações simples, salvo automaticamente.
- Ideal para lembretes ou ideias rápidas.

### ⚙️ Configurações

- **Exportar dados** → gera um arquivo `.json` com backup de todas as informações.
- **Importar dados** → restaura informações de um backup salvo.
- Inclui tarefas, estudos, finanças, notas e configurações do Pomodoro.

---

## 🧩 Tecnologias usadas

- **Next.js 14 (App Router)**
- **React 18**
- **@ducanh2912/next-pwa** (para PWA e cache offline)
- **LocalStorage** (armazenamento local de dados)
- **CSS customizado** (design leve e responsivo)

---

## 🚀 Como rodar localmente

```bash
# Requisitos: Node.js 18 ou superior
npm install
npm run dev
# Acesse: http://localhost:3000
```

## 📦 CI / Build

Um workflow de GitHub Actions foi adicionado (`.github/workflows/ci.yml`) que roda o build em pushes/pull requests para `main`.

Para gerar um build localmente:

```powershell
npm ci
npm run build
# Em produção, use `npm run start` para iniciar o servidor criado pelo Next.js
```

---

## 🔔 FCM (Push) — Como reativar com segurança

O app já está preparado para notificações push via Firebase Cloud Messaging (FCM), mas por padrão vem desativado para simplificar. Siga estes passos quando quiser ativar:

1) Variáveis de ambiente
- Em `.env.local` (ou na Vercel) defina:
  - `NEXT_PUBLIC_ENABLE_DEV_TOOLS=true` (habilita páginas /debug/fcm e /qr)
  - `NEXT_PUBLIC_ENABLE_FCM=true`
  - `NEXT_PUBLIC_SITE_URL=https://seu-dominio.com` (ou `http://localhost:3000` em dev)
  - As chaves do Firebase Web (SDK): `NEXT_PUBLIC_FIREBASE_*` e `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

2) Credenciais de servidor (Service Account)
- Nunca versione a chave. Use variável de ambiente do runtime:
  - `GOOGLE_SERVICE_ACCOUNT_JSON` com o JSON inteiro (recomendado)
  - ou `GOOGLE_APPLICATION_CREDENTIALS` apontando para o caminho do arquivo no servidor (ex.: `E:\credenciais\tdah-service.json`).

3) Executar localmente (para testar background)
- Em dev, o SW do PWA costuma ficar desativado. Para testar push em background, rode:
  - `npm run build && npm start`
  - Acesse `/debug/fcm` para gerar/copiar o token.
- Em Configurações, use “Enviar teste (servidor)” (endpoint `/api/fcm/send`).

4) Produção (ex.: Vercel)
- Configure `NEXT_PUBLIC_*` e `NEXT_PUBLIC_ENABLE_FCM=true` nas variáveis.
- Adicione `GOOGLE_SERVICE_ACCOUNT_JSON` (secreto) com o JSON da Service Account.
- Faça o deploy; o botão de envio em Configurações passa a funcionar.

Notas
- O Service Worker é único (o do PWA, `/sw.js`). O antigo `public/firebase-messaging-sw.js` foi removido para evitar conflito.
- Opcionalmente, você pode enviar mensagens via terminal com `scripts/send-fcm.mjs`.

## 🌱 Versões: Usuário vs Desenvolvedor

- **Versão de testes (usuário final)**  
  - Configure apenas `NEXT_PUBLIC_SITE_URL` e, opcionalmente, `NEXT_PUBLIC_FEEDBACK_URL`.  
  - Mantenha `NEXT_PUBLIC_ENABLE_DEV_TOOLS=false` para ocultar páginas /debug/fcm, /qr e recursos internos.

- **Versão de desenvolvedor**  
  - Defina `NEXT_PUBLIC_ENABLE_DEV_TOOLS=true`.  
  - Recursos extra disponíveis:
    - `/debug/fcm` (gera tokens, testa notificações locais)
    - `/qr` (gera QR codes com UTMs)
    - Link “QR Code” no rodapé
    - Endpoint `/api/fcm/send`
  - Combine com `NEXT_PUBLIC_ENABLE_FCM=true` para liberar o envelope completo de push.

Sugestão de fluxo:
- `main` → build de testes (dev tools desligados) para amigos/usuários.
- `dev` ou branch separada → build de desenvolvimento com dev tools habilitados.
