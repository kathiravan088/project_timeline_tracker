const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        where: { role: 'USER' },
        include: { projects: true }
    })

    const projects = await prisma.project.findMany({
        where: { userId: null }
    })

    console.log('--- Students ---')
    users.forEach(u => {
        console.log(`${u.id}: ${u.name} (${u.email}) - Projects: ${u.projects.length}`)
    })

    console.log('\n--- Available Projects ---')
    projects.forEach(p => {
        console.log(`${p.id}: ${p.name} (Guide: ${p.guideName || 'None'})`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
