# JDMBurger

Sistema interno de gestão para hamburgueria. Ferramenta fechada para a equipe (atendente, cozinha, admin) anotar pedidos, cadastrar clientes e produtos, e acompanhar um resumo no dashboard.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript estrito |
| UI | Tailwind CSS v4 + shadcn/ui |
| Banco | PostgreSQL (Supabase) + Prisma v7 |
| Auth | NextAuth.js v4 (Credentials) |
| Validação | Zod |
| Senha | bcryptjs |

---

## Pré-requisitos

- Node.js 20+
- npm 10+
- Banco PostgreSQL acessível (local ou Supabase)

---

## Instalação

```bash
# 1. Clone e instale as dependências
npm install

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com sua DATABASE_URL e NEXTAUTH_SECRET

# 3. Aplique as migrations
npx prisma migrate dev

# 4. Crie o usuário admin inicial
npx prisma db seed

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Variáveis de ambiente

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/banco"
NEXTAUTH_SECRET="string-aleatoria-segura"
NEXTAUTH_URL="http://localhost:3000"
```

Para gerar um `NEXTAUTH_SECRET` seguro:
```bash
openssl rand -base64 32
```

---

## Acesso inicial

Após rodar o seed:

| Campo | Valor |
|-------|-------|
| E-mail | `admin@jdmburger.com` |
| Senha | `admin123` |

> Troque a senha após o primeiro login em produção.

---

## Papéis de usuário

| Papel | Acesso |
|-------|--------|
| `admin` | Tudo — usuários, produtos, clientes, pedidos, dashboard |
| `atendente` | Clientes, pedidos, dashboard |
| `cozinha` | Apenas painel de pedidos pendentes |

---

## Scripts

```bash
npm run dev        # Servidor de desenvolvimento
npm run build      # Build de produção
npm run start      # Servidor de produção
npm run lint       # Lint

npx prisma studio          # Interface visual do banco
npx prisma migrate dev     # Criar e aplicar migration
npx prisma db seed         # Rodar seed
npx prisma generate        # Regenerar cliente Prisma
```

---

## Estrutura

```
src/
├── app/
│   ├── (auth)/login/       # Tela de login
│   ├── (dashboard)/        # Área autenticada
│   └── api/auth/           # NextAuth handler
├── components/             # Componentes reutilizáveis
│   └── ui/                 # shadcn/ui
├── lib/
│   ├── auth.ts             # Configuração NextAuth
│   └── prisma.ts           # Singleton do Prisma
└── types/
    └── next-auth.d.ts      # Extensão de tipos da sessão

prisma/
├── schema.prisma           # Modelos do banco
├── seed.ts                 # Seed inicial
└── migrations/             # Histórico de migrations
```

---

## Escopo da v1

- Pedidos com status: `recebido → preparando → pronto → entregue`
- Tipos de pedido: mesa, retirada, delivery
- Formas de pagamento: dinheiro, cartão crédito/débito, pix
- Painel da cozinha com polling (sem WebSocket — v2)
- Sem recuperação de senha, sem cadastro público, sem pagamento online
