const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        where: { role: 'USER' },
        select: { id: true, name: true, email: true, projects: { select: { id: true } } }
    })

    const projects = await prisma.project.findMany({
        where: { userId: null },
        select: { id: true, name: true, guideName: true }
    })

    const results = {
        students: users.filter(u => u.projects.length === 0),
        availableProjects: projects
    }

    fs.writeFileSync('c:/Users/HP/Downloads/project-tracker-ui/scripts/data.json', JSON.stringify(results, null, 2))
    console.log('Data written to scripts/data.json')
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
