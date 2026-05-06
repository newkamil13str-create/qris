// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123456', 12)
  const apiKey = randomBytes(32).toString('hex')

  const admin = await prisma.user.upsert({
    where: { email: 'admin@kamilshop.my.id' },
    update: {},
    create: {
      name: 'Admin KAMIL SHOP',
      email: 'admin@kamilshop.my.id',
      password: passwordHash,
      role: 'ADMIN',
      plan: 'MAX',
      apiKey,
    },
  })
  console.log('Seeded admin:', admin.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
