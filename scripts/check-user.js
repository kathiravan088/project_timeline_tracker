const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const prisma = new PrismaClient()

async function main() {
  const email = 'demo@trackflow.app'
  const user = await prisma.user.findUnique({ where: { email } })
  console.log('User from DB:', user)
  if (user) {
    const valid = await bcrypt.compare('demo1234', user.password)
    console.log('Password matches demo1234:', valid)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
