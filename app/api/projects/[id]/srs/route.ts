import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { mkdir } from 'fs/promises'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const srsDocuments = await prisma.srsdocument.findMany({
            where: { projectId: parseInt(id) },
            orderBy: { uploadDate: 'desc' },
        })

        return NextResponse.json(srsDocuments)
    } catch (error) {
        console.error('Failed to fetch SRS documents:', error)
        return NextResponse.json({ error: 'Failed to fetch SRS documents' }, { status: 500 })
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const formData = await request.formData()
        const file = formData.get('file') as File
        const name = formData.get('name') as string

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        if (file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const uploadDir = join(process.cwd(), 'public', 'uploads', 'srs')
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (e) {
            // Ignore if directory already exists
        }

        const fileName = `${Date.now()}-${file.name}`
        const filePath = join(uploadDir, fileName)
        const relativePath = `/uploads/srs/${fileName}`

        await writeFile(filePath, buffer)

        const srsDocument = await prisma.srsdocument.create({
            data: {
                name: name || file.name,
                fileName: file.name,
                filePath: relativePath,
                status: 'pending',
                projectId: parseInt(id),
                updatedAt: new Date(),
            },
        })

        return NextResponse.json(srsDocument, { status: 201 })
    } catch (error) {
        console.error('Failed to upload SRS:', error)
        return NextResponse.json({ error: 'Failed to upload SRS' }, { status: 500 })
    }
}
