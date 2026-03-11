const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const projects = await prisma.project.findMany({
        include: {
            user: true,
        }
    })
    console.log(`Found ${projects.length} projects:`)
    projects.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} (ID: ${p.id}, User: ${p.user?.email})`)
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
