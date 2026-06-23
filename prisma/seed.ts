import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const exists = await prisma.usuario.findUnique({ where: { email: 'admin@jdmburger.com' } })
  if (!exists) {
    await prisma.usuario.create({
      data: {
        nome: 'Admin',
        email: 'admin@jdmburger.com',
        senhaHash: await bcrypt.hash('admin123', 12),
        papel: 'admin',
      },
    })
    console.log('Seed: admin user created')
  } else {
    console.log('Seed: admin user already exists')
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
