const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('password123', 10);

    console.log('--- CLEANING DATABASE ---');
    await prisma.dailyLog.deleteMany({});
    await prisma.teamMember.deleteMany({});
    await prisma.projectReview.deleteMany({});
    await prisma.projectDocument.deleteMany({});
    await prisma.srsDocument.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('--- SEEDING USERS ---');
    const admin = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            name: 'Dr. Smith (Admin)',
            password: password,
            role: 'ADMIN',
        },
    });

    const faculty = await prisma.user.create({
        data: {
            email: 'faculty@example.com',
            name: 'Prof. Miller (Faculty)',
            password: password,
            role: 'FACULTY',
        },
    });

    const student1 = await prisma.user.create({
        data: {
            email: 'student1@example.com',
            name: 'John Doe (Student)',
            password: password,
            role: 'USER',
        },
    });

    const student2 = await prisma.user.create({
        data: {
            email: 'student2@example.com',
            name: 'Jane Smith (Student)',
            password: password,
            role: 'USER',
        },
    });

    console.log('Users created: admin@example.com, faculty@example.com, student1@example.com, student2@example.com');

    console.log('--- SEEDING PROJECTS ---');

    // Projects for Student 1
    await prisma.project.create({
        data: {
            name: 'AI-Powered Smart Home',
            description: 'A smart home automation system using AI for energy optimization.',
            status: 'in-progress',
            fromDate: new Date().toISOString(),
            toDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            assignedEmail: student1.email,
            assignedName: student1.name,
            assignedId: 'S1-1001',
            userId: student1.id,
        }
    });

    await prisma.project.create({
        data: {
            name: 'Blockchain Voting System',
            description: 'A secure and transparent voting platform based on blockchain technology.',
            status: 'pending',
            fromDate: new Date().toISOString(),
            toDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
            assignedEmail: student1.email,
            assignedName: student1.name,
            assignedId: 'S1-1001',
            userId: student1.id,
        }
    });

    // Project for Student 2
    await prisma.project.create({
        data: {
            name: 'Virtual Reality Classroom',
            description: 'An immersive educational platform for remote learning using VR.',
            status: 'approved',
            fromDate: new Date().toISOString(),
            toDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            assignedEmail: student2.email,
            assignedName: student2.name,
            assignedId: 'S2-2002',
            userId: student2.id,
        }
    });

    // Unassigned Proposals (Created by Faculty)
    await prisma.project.create({
        data: {
            name: 'IoT Waste Management',
            description: 'Smart bins that notify collection services when full using ultrasonic sensors.',
            status: 'not-started',
            fromDate: new Date().toISOString(),
            toDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
            userId: null,
        }
    });

    await prisma.project.create({
        data: {
            name: 'Autonomous Delivery Drone',
            description: 'Designing and programming a drone capable of navigating urban environments for package delivery.',
            status: 'not-started',
            fromDate: new Date().toISOString(),
            toDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
            userId: null,
        }
    });

    await prisma.project.create({
        data: {
            name: 'Deep Learning for Medical Imaging',
            description: 'Implementing CNNs to assist in early detection of diseases from X-ray and MRI scans.',
            status: 'not-started',
            fromDate: new Date().toISOString(),
            toDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            userId: null,
        }
    });

    console.log('Projects Created: Student 1 (2), Student 2 (1), Unassigned Proposals (3)');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
