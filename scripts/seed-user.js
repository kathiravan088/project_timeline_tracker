const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@trackflow.app'
  const adminName = 'Admin User'
  const adminPassword = 'admin123'
  const adminHashed = await bcrypt.hash(adminPassword, 10)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: adminName, password: adminHashed, role: 'ADMIN' },
    create: { email: adminEmail, name: adminName, password: adminHashed, role: 'ADMIN' },
  })

  console.log('Upserted admin:', { id: admin.id, email: admin.email, role: admin.role })

  const userEmail = 'user@trackflow.app'
  const userName = 'Regular User'
  const userPassword = 'user123'
  const userHashed = await bcrypt.hash(userPassword, 10)

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: { name: userName, password: userHashed, role: 'USER' },
    create: { email: userEmail, name: userName, password: userHashed, role: 'USER' },
  })

  console.log('Upserted user:', { id: user.id, email: user.email, role: user.role })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
