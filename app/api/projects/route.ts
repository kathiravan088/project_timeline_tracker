import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const projects = await prisma.project.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, status, fromDate, toDate, assignedEmail, userId } = body

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status,
        fromDate,
        toDate,
        assignedEmail,
        userId,
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Failed to create project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
