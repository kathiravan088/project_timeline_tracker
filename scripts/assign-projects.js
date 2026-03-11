const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const faculty = await prisma.user.findFirst({ where: { role: 'FACULTY' } })
    const student = await prisma.user.findUnique({ where: { id: 6 } })

    if (!faculty || !student) {
        console.log('Faculty or Student not found')
        return
    }

    const proposals = [
        {
            name: 'Smart Agriculture System',
            description: 'Using IoT and AI to optimize crop yield and water usage in urban farming.',
            technologies: 'Python, TensorFlow, Raspberry Pi',
            maxStudents: 3,
            guideName: faculty.name,
            status: 'not-started',
            fromDate: new Date().toISOString(),
            toDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            name: 'Decentralized Identity Manager',
            description: 'A blockchain-based solution for secure and private identity verification without central authorities.',
            technologies: 'Solidity, Ethereum, React',
            maxStudents: 2,
            guideName: faculty.name,
            status: 'not-started',
            fromDate: new Date().toISOString(),
            toDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            name: 'AR Navigation for Indoors',
            description: 'Augmented Reality application for precise indoor navigation in large complexes like hospitals and airports.',
            technologies: 'Unity, ARKit, C#',
            maxStudents: 4,
            guideName: faculty.name,
            status: 'not-started',
            fromDate: new Date().toISOString(),
            toDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString()
        }
    ]

    console.log('Creating proposals...')
    const created = []
    for (const p of proposals) {
        const project = await prisma.project.create({ data: p })
        created.push(project)
        console.log(`Created: ${project.name} (ID: ${project.id})`)
    }

    // Assign the first one to the unassigned student
    console.log(`\nAssigning "${created[0].name}" to ${student.name}...`)
    await prisma.project.update({
        where: { id: created[0].id },
        data: {
            userId: student.id,
            assignedEmail: student.email,
            assignedName: student.name,
            status: 'in-progress'
        }
    })

    console.log('Done!')
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
