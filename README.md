# NullShell

Aplicação Next.js 14 (App Router) com Auth.js v5, Prisma + SQLite, histórico persistente, base de conhecimento, cache de respostas e streaming via OpenRouter.

## OpenRouter

Crie uma conta na OpenRouter, abra a área de API Keys, gere uma chave e salve-a apenas no servidor em `.env` como `OPENROUTER_API_KEY`. Nunca use o prefixo `NEXT_PUBLIC_`.

Modelo padrão: `cognitivecomputations/dolphin-mistral-24b-venice-edition:free`.

## NEXTAUTH_SECRET

Gere com:

```bash
openssl rand -base64 32
```

Configure também `NEXTAUTH_URL=http://localhost:3000` localmente e use o domínio HTTPS real em produção.

## Rodar localmente

Linux/macOS/Git Bash:

```bash
npm install
cp .env.example .env
# edite .env
npm run seed
npm run dev
```

Windows PowerShell:

```powershell
npm install
Copy-Item .env.example .env
# edite .env
npm run seed
npm run dev
```

O `npm run dev` executa `prisma generate` e `prisma db push` antes do Next.js.

## Criar o primeiro usuário

Defina no `.env`:

```env
SEED_EMAIL=admin@example.com
SEED_PASSWORD=uma-senha-forte-com-8-ou-mais
```

Depois execute `npm run seed`. O seed usa `bcryptjs` com custo 12.

## Vercel

Importe o repositório e configure `OPENROUTER_API_KEY`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL=https://seu-dominio-real` e `DATABASE_URL=file:./dev.db`.

O build executa automaticamente `prisma generate && next build`.

### Limitação importante do SQLite na Vercel

SQLite local é persistente em desenvolvimento e em hosts Node.js com disco persistente. O filesystem de funções serverless da Vercel não é armazenamento durável; por isso usuários, histórico e notas podem não persistir entre instâncias/deploys.

Para memória realmente persistente, use um host Node.js com volume persistente ou altere o datasource para um banco remoto compatível com Prisma.

## Outro host Node.js

Com Node.js 20+ e disco gravável:

```bash
npm install
cp .env.example .env
npx prisma db push
npm run seed
npm run build
npm start
```

## Garantias implementadas

- OpenRouter só é chamada em `app/api/chat/route.ts`.
- A API key não vai para o navegador.
- `/api/chat` exige autenticação.
- JWT fica em cookie httpOnly e `secure` em produção.
- 401, 429 e timeout viram erros seguros e visíveis.
- `data: [DONE]` é tratado antes do JSON.parse.
- Cache usa SHA-256 do modelo + mensagens realmente enviadas (incluindo notas relevantes) e validade de 24h.
- "Forçar nova resposta" ignora o cache.
