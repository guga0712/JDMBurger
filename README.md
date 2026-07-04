# JDMBurger

> Sistema interno de gestão para hamburguerias — pedidos, clientes, produtos e cozinha em um só lugar.

Ferramenta fechada para uso da equipe. Não é um app público — o acesso é restrito a usuários cadastrados pelo administrador.

---

## Funcionalidades

- **Pedidos** — criação, acompanhamento de status e histórico completo
- **Cozinha** — painel dedicado com atualização em tempo real por polling
- **Clientes** — cadastro com busca por nome, telefone ou e-mail
- **Produtos** — gerenciamento de cardápio com categorias e disponibilidade
- **Dashboard** — visão geral do dia para o admin
- **Controle de acesso** — três papéis com permissões distintas

---

## Stack

| Camada      | Tecnologia                          |
|-------------|-------------------------------------|
| Framework   | Next.js 16 (App Router)             |
| Linguagem   | TypeScript estrito                  |
| UI          | Tailwind CSS v4 + shadcn/ui         |
| Banco       | PostgreSQL (Supabase) + Prisma v7   |
| Auth        | NextAuth.js v4 (Credentials)        |
| Validação   | Zod                                 |
| Senha       | bcryptjs                            |

---

## Papéis de usuário

| Papel        | Acesso                                                   |
|--------------|----------------------------------------------------------|
| `admin`      | Tudo — usuários, produtos, clientes, pedidos, dashboard  |
| `atendente`  | Clientes, pedidos, dashboard                             |
| `cozinha`    | Apenas painel de pedidos pendentes                       |

---

## Instalação

**Pré-requisitos:** Node.js 20+, npm 10+, PostgreSQL acessível (local ou Supabase)

```bash
# 1. Instale as dependências
npm install

# 2. Configure as variáveis de ambiente
cp .env.example .env

# 3. Aplique as migrations
npx prisma migrate dev

# 4. Crie o usuário admin inicial
npx prisma db seed

# 5. Inicie o servidor
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

## Scripts

```bash
# Desenvolvimento
npm run dev        # Inicia o servidor local
npm run build      # Build de produção
npm run start      # Serve o build de produção
npm run lint       # Verifica o código com ESLint

# Banco de dados
npx prisma migrate dev     # Cria e aplica migrations
npx prisma db seed         # Popula o banco com dados iniciais
npx prisma studio          # Interface visual do banco
npx prisma generate        # Regenera o Prisma Client
```

---

## Estrutura do projeto

```
src/
├── app/
│   ├── (auth)/login/       # Tela de login
│   ├── (dashboard)/        # Área autenticada
│   └── api/                # Rotas de API
├── components/             # Componentes reutilizáveis
│   └── ui/                 # Componentes shadcn/ui
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

- Fluxo de pedidos: `recebido → preparando → pronto → entregue`
- Tipos de pedido: mesa, retirada, delivery
- Formas de pagamento: dinheiro, cartão de crédito, pix
- Painel da cozinha com polling (WebSocket planejado para v2)
- Sem recuperação de senha, cadastro público ou pagamento online
