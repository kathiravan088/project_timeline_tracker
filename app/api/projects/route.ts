import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    console.log('Projects API call - Session:', session ? `User: ${session.user?.email}` : 'No Session');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    const userId = (session.user as any).id
    const isPrivileged = userRole === 'ADMIN' || userRole === 'FACULTY'

    console.log('User Role:', userRole, 'User ID:', userId);

    const parsedUserId = userId ? parseInt(userId) : -1;

    const projects = await prisma.project.findMany({
      where: isPrivileged ? {} : {
        OR: [
          { userId: parsedUserId },
          // @ts-ignore
          { userId: null }
        ]
      },
      include: {
        user: true,
        teammember: true,
        srsdocument: true,
        projectreview: true,
        projectdocument: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const mappedProjects = projects.map(p => ({
      ...p,
      teamMembers: p.teammember,
      srsDocuments: p.srsdocument,
      reviews: p.projectreview,
      documents: p.projectdocument,
    }))

    return NextResponse.json(mappedProjects)
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const userRole = (session.user as any).role

    // If not Admin, force status to pending and use session user's email if not provided
    let { name, description, status, fromDate, toDate, assignedEmail, assignedName, assignedId, userId, teamMembers, technologies, maxStudents, guideName, isProposal } = body

    if (userRole !== 'ADMIN' && userRole !== 'FACULTY') {
      status = 'pending'
      assignedEmail = session.user?.email || assignedEmail
    }

    if (isProposal && (userRole === 'ADMIN' || userRole === 'FACULTY')) {
      userId = null
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status || 'not-started',
        fromDate: fromDate || new Date().toISOString(),
        toDate: toDate || new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
        assignedEmail: assignedEmail || null,
        assignedName: assignedName || "",
        assignedId: assignedId || "",
        guideName: guideName || "",
        updatedAt: new Date(),
        // @ts-ignore
        userId: userId ? parseInt(userId.toString()) : null,
        technologies: technologies || "",
        maxStudents: maxStudents ? parseInt(maxStudents.toString()) : 1,
        teammember: {
          create: teamMembers?.map((member: any) => ({
            name: member.name,
            employeeId: member.employeeId,
          })) || [],
        },
      },
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

    return NextResponse.json(mappedProject, { status: 201 })
  } catch (error) {
    console.error('Failed to create project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
