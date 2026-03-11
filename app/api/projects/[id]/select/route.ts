import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const projectId = parseInt((await params).id)
        const userId = parseInt((session.user as any).id)
        const userEmail = session.user.email
        const userName = session.user.name

        // Check if project is available
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        })

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        if (project.userId !== null) {
            return NextResponse.json({ error: 'Project already assigned' }, { status: 400 })
        }

        // Assign project to student
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                userId: userId,
                assignedEmail: userEmail,
                assignedName: userName,
                status: 'approved' // Automatically approve selected proposals
            }
        })

        return NextResponse.json(updatedProject)
    } catch (error) {
        console.error('Selection error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
