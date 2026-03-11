import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const documents = await prisma.projectdocument.findMany({
            where: { projectId: parseInt(id) },
            orderBy: { uploadDate: 'desc' },
        })

        return NextResponse.json(documents)
    } catch (error) {
        console.error('Failed to fetch documents:', error)
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
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
        const templateName = formData.get('templateName') as string

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const uploadDir = join(process.cwd(), 'public', 'uploads', 'documents')
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (e) {
            // Ignore if directory already exists
        }

        const fileName = `${Date.now()}-${file.name}`
        const filePath = join(uploadDir, fileName)
        const relativePath = `/uploads/documents/${fileName}`

        await writeFile(filePath, buffer)

        const document = await prisma.projectdocument.create({
            data: {
                templateName: templateName || file.name,
                fileName: file.name,
                filePath: relativePath,
                projectId: parseInt(id),
                updatedAt: new Date(),
            },
        })

        return NextResponse.json(document, { status: 201 })
    } catch (error) {
        console.error('Failed to upload document:', error)
        return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
    }
}
