import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true,
        teammember: true,
        srsdocument: true,
        projectreview: true,
        projectdocument: true,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const mappedProject = {
      ...project,
      teamMembers: project.teammember,
      srsDocuments: project.srsdocument,
      reviews: project.projectreview,
      documents: project.projectdocument,
    }

    return NextResponse.json(mappedProject)
  } catch (error) {
    console.error('Failed to fetch project:', error)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN' && userRole !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { teamMembers, ...rest } = body

    // If teamMembers are provided, update them
    if (teamMembers) {
      // Simple strategy: delete existing and create new
      // Note: This will set teamMemberId to null in logs due to SetNull
      await prisma.teammember.deleteMany({
        where: { projectId: parseInt(id) }
      })

      if (teamMembers.length > 0) {
        await prisma.teammember.createMany({
          data: teamMembers.map((member: any) => ({
            name: member.name,
            employeeId: member.employeeId,
            projectId: parseInt(id),
          }))
        })
      }
    }

    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: rest,
      include: {
        user: true,
        teammember: true,
        srsdocument: true,
        projectreview: true,
        projectdocument: true,
      },
    })

    const mappedProject = {
      ...project,
      teamMembers: project.teammember,
      srsDocuments: project.srsdocument,
      reviews: project.projectreview,
      documents: project.projectdocument,
    }

    return NextResponse.json(mappedProject)
  } catch (error) {
    console.error('Failed to update project:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN' && userRole !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await prisma.project.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: 'Project deleted' })
  } catch (error) {
    console.error('Failed to delete project:', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
