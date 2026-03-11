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
        const reviews = await prisma.projectreview.findMany({
            where: { projectId: parseInt(id) },
            orderBy: { reviewDate: 'asc' },
        })

        return NextResponse.json(reviews)
    } catch (error) {
        console.error('Failed to fetch project reviews:', error)
        return NextResponse.json({ error: 'Failed to fetch project reviews' }, { status: 500 })
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
        const { reviewType, reviewDate, meetLink } = body

        const review = await prisma.projectreview.create({
            data: {
                reviewType: reviewType || 'Review 1',
                reviewDate: new Date(reviewDate),
                meetLink,
                status: 'scheduled',
                projectId: parseInt(id),
                updatedAt: new Date(),
            },
        })

        return NextResponse.json(review, { status: 201 })
    } catch (error) {
        console.error('Failed to schedule review:', error)
        return NextResponse.json({ error: 'Failed to schedule review' }, { status: 500 })
    }
}
