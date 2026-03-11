const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
    const email = 'admin@trackflow.app'
    const password = 'admin123'

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
        console.log(`User ${email} not found!`)
        return
    }

    console.log(`User found: ${user.name} (${user.email})`)
    console.log(`Role: ${user.role}`)

    const match = await bcrypt.compare(password, user.password)
    console.log(`Password match for 'admin123': ${match}`)

    if (!match) {
        console.log(`Actual hash in DB: ${user.password}`)
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
