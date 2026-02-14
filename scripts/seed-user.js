const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const prisma = new PrismaClient()

async function main() {
  const email = 'demo@trackflow.app'
  const name = 'Demo User'
  const password = 'demo1234'

  const hashed = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, password: hashed },
    create: { email, name, password: hashed },
  })

  console.log('Upserted user:', { id: user.id, email: user.email, name: user.name })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
