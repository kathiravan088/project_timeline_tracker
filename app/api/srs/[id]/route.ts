import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'

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
        const { status, comments } = body

        const srsDocument = await prisma.srsdocument.update({
            where: { id: parseInt(id) },
            data: {
                status,
                comments,
            },
        })

        return NextResponse.json(srsDocument)
    } catch (error) {
        console.error('Failed to update SRS document:', error)
        return NextResponse.json({ error: 'Failed to update SRS document' }, { status: 500 })
    }
}
