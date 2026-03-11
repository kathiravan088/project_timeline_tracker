const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('password123', 10);

    // Clear existing data (optional but helpful for a clean demo)
    // await prisma.dailyLog.deleteMany();
    // await prisma.projectReview.deleteMany();
    // await prisma.projectDocument.deleteMany();
    // await prisma.srsDocument.deleteMany();
    // await prisma.teamMember.deleteMany();
    // await prisma.project.deleteMany();
    // await prisma.user.deleteMany();

    // Create Users
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Dr. Smith (Guide)',
            password: password,
            role: 'ADMIN',
        },
    });

    const student1 = await prisma.user.upsert({
        where: { email: 'student1@example.com' },
        update: {},
        create: {
            email: 'student1@example.com',
            name: 'John Doe',
            password: password,
            role: 'USER',
        },
    });

    const student2 = await prisma.user.upsert({
        where: { email: 'student2@example.com' },
        update: {},
        create: {
            email: 'student2@example.com',
            name: 'Jane Smith',
            password: password,
            role: 'USER',
        },
    });

    const faculty = await prisma.user.upsert({
        where: { email: 'faculty@example.com' },
        update: {},
        create: {
            email: 'faculty@example.com',
            name: 'Prof. Miller (Faculty)',
            password: password,
            role: 'FACULTY',
        },
    });

    console.log('Users created:', { admin: admin.email, faculty: faculty.email, student1: student1.email, student2: student2.email });

    // Create Project for Faculty
    await prisma.project.create({
        data: {
            name: 'Cybersecurity Audit Tool',
            description: 'Advanced tool for auditing network security vulnerabilities.',
            status: 'in-progress',
            fromDate: '2026-03-10',
            toDate: '2026-04-20',
            assignedEmail: faculty.email,
            assignedName: faculty.name,
            assignedId: 'F-101',
            userId: faculty.id,
        },
    });

    // Create Projects for Student 1
    await prisma.project.create({
        data: {
            name: 'AI Chatbot System',
            description: 'A comprehensive AI chatbot for customer support integration.',
            status: 'in-progress',
            fromDate: '2026-03-01',
            toDate: '2026-04-10',
            assignedEmail: student1.email,
            assignedName: student1.name,
            assignedId: 'S1-123',
            userId: student1.id,
            teamMembers: {
                create: [
                    { name: 'John Doe', employeeId: 'S1-123' },
                    { name: 'Alice Wong', employeeId: 'S1-456' },
                ]
            }
        },
    });

    await prisma.project.create({
        data: {
            name: 'E-commerce Platform',
            description: 'Building a modern e-commerce site with Next.js and Tailwind.',
            status: 'not-started',
            fromDate: '2026-03-15',
            toDate: '2026-04-25',
            assignedEmail: student1.email,
            assignedName: student1.name,
            assignedId: 'S1-123',
            userId: student1.id,
        },
    });

    // Create Project for Student 2
    await prisma.project.create({
        data: {
            name: 'Health Monitoring App',
            description: 'IoT based health monitoring system for elderly people.',
            status: 'pending',
            fromDate: '2026-03-05',
            toDate: '2026-04-15',
            assignedEmail: student2.email,
            assignedName: student2.name,
            assignedId: 'S2-789',
            userId: student2.id,
        },
    });

    // Create Project for Admin (just to show Admin owns something too)
    await prisma.project.create({
        data: {
            name: 'Department Lab Manager',
            description: 'Internal tool for managing department lab resources.',
            status: 'approved',
            fromDate: '2026-02-01',
            toDate: '2026-03-15',
            assignedEmail: admin.email,
            assignedName: admin.name,
            assignedId: 'A-001',
            userId: admin.id,
        },
    });

    console.log('Demo projects seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
