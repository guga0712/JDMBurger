import { type AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const parsed = credentialsSchema.safeParse(credentials)
          if (!parsed.success) return null

          const { email, password } = parsed.data

          const user = await prisma.usuario.findUnique({
            where: { email },
          })

          if (!user) return null

          const passwordMatch = await bcrypt.compare(password, user.senhaHash)
          if (!passwordMatch) return null

          return {
            id: user.id,
            nome: user.nome,
            email: user.email,
            papel: user.papel,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.nome = user.nome
        token.papel = user.papel
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.nome = token.nome as string
        session.user.papel = token.papel as 'admin' | 'atendente' | 'cozinha'
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}
