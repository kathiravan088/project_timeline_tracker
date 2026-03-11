"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import type { ProjectDocument } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Download, Upload, Loader2, File as FileIcon } from "lucide-react"
import { format } from "date-fns"

export function DocumentSection({ projectId }: { projectId: number }) {
    const { user } = useApp()
    const [documents, setDocuments] = useState<ProjectDocument[]>([])
    const [loading, setLoading] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const [newDoc, setNewDoc] = useState({
        templateName: "Project Report",
        file: null as File | null
    })

    const isAdmin = user?.role === "ADMIN" || user?.role === "FACULTY"

    const fetchDocuments = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/documents`)
            if (res.ok) {
                const data = await res.json()
                setDocuments(data)
            }
        } catch (err) {
            console.error("Failed to fetch documents", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDocuments()
    }, [projectId])

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newDoc.file) return
        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", newDoc.file)
            formData.append("templateName", newDoc.templateName)

            const res = await fetch(`/api/projects/${projectId}/documents`, {
                method: "POST",
                body: formData,
            })
            if (res.ok) {
                setNewDoc({ templateName: "Project Report", file: null })
                fetchDocuments()
            }
        } catch (err) {
            console.error("Failed to upload document", err)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6 space-y-4">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Upload className="h-4 w-4 text-primary" />
                        Upload Project Documents
                    </h4>
                    <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Document Type / Template Name</Label>
                            <Input
                                placeholder="e.g. Project Report, Final Code"
                                value={newDoc.templateName}
                                onChange={e => setNewDoc({ ...newDoc, templateName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Select File</Label>
                            <Input
                                type="file"
                                onChange={e => setNewDoc({ ...newDoc, file: e.target.files?.[0] || null })}
                            />
                        </div>
                        <Button type="submit" disabled={isUploading || !newDoc.file} className="md:col-span-2">
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                            Upload Document
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Document Library
                </h4>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-12 border border-dashed rounded-xl bg-muted/20">
                        <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-3">
                            {documents.map((doc) => (
                                <Card key={doc.id} className="border-border/60 hover:border-border transition-colors">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 p-2 rounded-lg">
                                                <FileIcon className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="font-semibold text-sm">{doc.templateName}</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {doc.fileName} • {format(new Date(doc.uploadDate), "PPP")}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <a href={doc.filePath} download>
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </div>
        </div>
    )
}
