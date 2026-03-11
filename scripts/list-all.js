const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany()
    const projects = await prisma.project.findMany()

    console.log('--- All Users ---')
    users.forEach(u => console.log(`${u.id}: ${u.name} [${u.role}] (${u.email})`))

    console.log('\n--- All Projects ---')
    projects.forEach(p => console.log(`${p.id}: ${p.name} (Assigned to ID: ${p.userId}, Guide: ${p.guideName})`))
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
