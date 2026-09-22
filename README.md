# NullShell

NullShell é uma aplicação Next.js 14 (App Router) com Auth.js v5, Prisma + PostgreSQL, histórico persistente, base de conhecimento, cache de respostas e streaming via OpenRouter.

## Produção: PostgreSQL

O projeto agora usa **PostgreSQL**, não SQLite. Isso permite que usuários, conversas, notas e cache persistam normalmente em ambientes serverless como a Vercel.

A configuração foi preparada para provedores como Neon:

- `DATABASE_URL`: conexão **pooled**, usada pela aplicação em runtime.
- `DIRECT_URL`: conexão **direta**, usada pelo Prisma Migrate.

## 1. OpenRouter

Crie uma conta na OpenRouter, abra a área de API Keys, gere uma chave e salve-a apenas no servidor:

```env
OPENROUTER_API_KEY=sua_chave
```

Nunca use prefixo `NEXT_PUBLIC_`.

Modelo padrão:

```text
cognitivecomputations/dolphin-mistral-24b-venice-edition:free
```

## 2. Auth.js

Gere o segredo:

```bash
openssl rand -base64 32
```

Depois configure:

```env
NEXTAUTH_SECRET=valor_gerado
NEXTAUTH_URL=http://localhost:3000
```

Na Vercel, `NEXTAUTH_URL` deve ser a URL HTTPS real do projeto/domínio.

## 3. Criar o PostgreSQL

No Neon, crie um projeto PostgreSQL e copie as duas URLs:

```env
DATABASE_URL="postgresql://...pooler.../neondb?sslmode=require"
DIRECT_URL="postgresql://.../neondb?sslmode=require"
```

Use a URL pooled em `DATABASE_URL` e a URL direta em `DIRECT_URL`.

## 4. Rodar localmente

Windows PowerShell:

```powershell
git clone https://github.com/joabest/AI.git
cd AI
git checkout test
npm install
Copy-Item .env.example .env
# preencha .env
npm run db:deploy
npm run seed
npm run dev
```

Linux/macOS/Git Bash:

```bash
git clone https://github.com/joabest/AI.git
cd AI
git checkout test
npm install
cp .env.example .env
# preencha .env
npm run db:deploy
npm run seed
npm run dev
```

## 5. Primeiro usuário

No `.env`:

```env
SEED_EMAIL=admin@example.com
SEED_PASSWORD=uma-senha-forte-com-8-ou-mais
```

Execute:

```bash
npm run seed
```

O seed usa `bcryptjs` com custo 12 e faz upsert pelo email.

## 6. Deploy na Vercel

Em **Settings → Environment Variables**, configure:

```text
OPENROUTER_API_KEY
NEXTAUTH_SECRET
NEXTAUTH_URL
DATABASE_URL
DIRECT_URL
```

Depois faça um redeploy.

O build executa:

```bash
prisma generate && prisma migrate deploy && next build
```

Assim, migrations versionadas são aplicadas automaticamente antes do build.

## 7. Outro host Node.js

Com Node.js 20+:

```bash
npm install
cp .env.example .env
npm run db:deploy
npm run seed
npm run build
npm start
```

Não há dependência exclusiva da Vercel.

## Banco e migrations

A migration inicial PostgreSQL está em:

```text
prisma/migrations/20260922123000_init_postgresql/migration.sql
```

Comandos úteis:

```bash
npm run db:deploy
npm run db:status
npm run db:studio
```

## Garantias implementadas

- PostgreSQL persistente em produção.
- OpenRouter chamada apenas em `app/api/chat/route.ts`.
- API key nunca é enviada ao client.
- `/api/chat` exige sessão autenticada.
- Auth.js v5 com middleware separado do Prisma para evitar incompatibilidade com Edge.
- JWT em cookie httpOnly e secure em produção.
- 401, 429 e timeout do OpenRouter geram erros seguros e visíveis.
- O parser SSE trata `data: [DONE]` antes de `JSON.parse`.
- Cache SHA-256 expira logicamente em 24h.
- "Forçar nova resposta" ignora cache.
- Histórico, notas e cache persistem no PostgreSQL.
