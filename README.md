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
