import { type DefaultSession, type DefaultJWT } from 'next-auth'

type Papel = 'admin' | 'atendente' | 'cozinha'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      nome: string
      papel: Papel
    } & DefaultSession['user']
  }

  interface User {
    id: string
    nome: string
    papel: Papel
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    nome: string
    papel: Papel
  }
}
