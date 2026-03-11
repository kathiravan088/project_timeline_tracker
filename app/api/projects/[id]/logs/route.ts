import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userRole = (session.user as any).role
        if (userRole !== 'ADMIN' && userRole !== 'FACULTY') {
            return NextResponse.json({ error: 'Forbidden: Only admins can view logs' }, { status: 403 })
        }

        const { id } = await params
        const logs = await prisma.dailylog.findMany({
            where: { projectId: parseInt(id) },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    }
                },
                teammember: true,
            },
            orderBy: {
                date: 'desc',
            },
        })

        const mappedLogs = logs.map(log => ({
            ...log,
            teamMember: log.teammember,
        }))

        return NextResponse.json(mappedLogs)
    } catch (error) {
        console.error('Failed to fetch logs:', error)
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { content, teamMemberId } = body

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 })
        }

        const log = await prisma.dailylog.create({
            data: {
                content,
                projectId: parseInt(id),
                userId: parseInt(session.user.id!),
                teamMemberId: teamMemberId ? parseInt(teamMemberId) : null,
                updatedAt: new Date(),
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    }
                },
                teammember: true,
            }
        })

        const mappedLog = {
            ...log,
            teamMember: log.teammember,
        }

        return NextResponse.json(mappedLog, { status: 201 })
    } catch (error) {
        console.error('Failed to create log:', error)
        return NextResponse.json({ error: 'Failed to create log' }, { status: 500 })
    }
}
