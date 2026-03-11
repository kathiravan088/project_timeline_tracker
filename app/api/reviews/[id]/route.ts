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
        const { marks, comments, status, meetLink, reviewDate } = body

        const updateData: any = {}
        if (marks !== undefined) updateData.marks = marks
        if (comments !== undefined) updateData.comments = comments
        if (status !== undefined) updateData.status = status
        if (meetLink !== undefined) updateData.meetLink = meetLink
        if (reviewDate !== undefined) updateData.reviewDate = new Date(reviewDate)

        const review = await prisma.projectreview.update({
            where: { id: parseInt(id) },
            data: updateData,
        })

        return NextResponse.json(review)
    } catch (error) {
        console.error('Failed to update project review:', error)
        return NextResponse.json({ error: 'Failed to update project review' }, { status: 500 })
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
        await prisma.projectreview.delete({
            where: { id: parseInt(id) },
        })

        return NextResponse.json({ message: 'Review deleted' })
    } catch (error) {
        console.error('Failed to delete project review:', error)
        return NextResponse.json({ error: 'Failed to delete project review' }, { status: 500 })
    }
}
