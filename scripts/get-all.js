const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        select: { id: true, name: true, role: true, email: true }
    })

    const projects = await prisma.project.findMany({
        select: { id: true, name: true, userId: true, guideName: true }
    })

    fs.writeFileSync('c:/Users/HP/Downloads/project-tracker-ui/scripts/all_data.json', JSON.stringify({ users, projects }, null, 2))
    console.log('Data written to scripts/all_data.json')
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
