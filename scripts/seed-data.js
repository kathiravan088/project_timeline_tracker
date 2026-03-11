const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    // Get an existing user or create one for the logs
    let user = await prisma.user.findFirst()
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: 'test@example.com',
                name: 'Test Administrator',
                password: 'password123', // In a real app, this should be hashed
                role: 'ADMIN'
            }
        })
    }

    // Create a new project with team members
    const project = await prisma.project.create({
        data: {
            name: 'Team Infrastructure Upgrade',
            description: 'Upgrading the core infrastructure to support new team features and daily log associations.',
            status: 'in-progress',
            fromDate: new Date().toISOString(),
            toDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            assignedEmail: user.email,
            assignedName: 'Infrastructure Lead',
            assignedId: 'INF-001',
            userId: user.id,
            teamMembers: {
                create: [
                    { name: 'Alice Smith', employeeId: 'EMP-101' },
                    { name: 'Bob Johnson', employeeId: 'EMP-102' },
                    { name: 'Charlie Davis', employeeId: 'EMP-103' }
                ]
            }
        },
        include: {
            teamMembers: true
        }
    })

    console.log(`Created project: ${project.name} with ${project.teamMembers.length} team members`)

    // Add some daily logs for the team members
    const alice = project.teamMembers.find(m => m.name === 'Alice Smith')
    const bob = project.teamMembers.find(m => m.name === 'Bob Johnson')

    if (alice) {
        await prisma.dailyLog.create({
            data: {
                content: 'Completed the migration of team member details to the new schema.',
                projectId: project.id,
                userId: user.id,
                teamMemberId: alice.id,
                date: new Date()
            }
        })
        console.log(`Added log for Alice`)
    }

    if (bob) {
        await prisma.dailyLog.create({
            data: {
                content: 'Initialized the frontend components for the daily log history view.',
                projectId: project.id,
                userId: user.id,
                teamMemberId: bob.id,
                date: new Date()
            }
        })
        console.log(`Added log for Bob`)
    }

    // Add a general log
    await prisma.dailyLog.create({
        data: {
            content: 'General team meeting to discuss project milestones.',
            projectId: project.id,
            userId: user.id,
            date: new Date()
        }
    })
    console.log(`Added general log`)

    console.log('Seeding completed successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
