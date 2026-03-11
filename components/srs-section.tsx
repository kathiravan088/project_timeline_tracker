"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import type { SrsDocument } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileUp, FileText, CheckCircle2, XCircle, Clock, MessageSquare, Download, Loader2 } from "lucide-react"
import { format } from "date-fns"

export function SrsSection({ projectId }: { projectId: number }) {
    const { user } = useApp()
    const [docs, setDocs] = useState<SrsDocument[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [name, setName] = useState("")
    const [reviewingId, setReviewingId] = useState<number | null>(null)
    const [reviewComment, setReviewComment] = useState("")
    const [isSubmittingReview, setIsSubmittingReview] = useState(false)

    const isAdmin = user?.role === "ADMIN" || user?.role === "FACULTY"

    const fetchDocs = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/srs`)
            if (res.ok) {
                const data = await res.json()
                setDocs(data)
            }
        } catch (err) {
            console.error("Failed to fetch SRS docs", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDocs()
    }, [projectId])

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append("file", file)
        formData.append("name", name || file.name)

        try {
            const res = await fetch(`/api/projects/${projectId}/srs`, {
                method: "POST",
                body: formData,
            })

            if (res.ok) {
                setFile(null)
                setName("")
                fetchDocs()
            }
        } catch (err) {
            console.error("Upload failed", err)
        } finally {
            setUploading(false)
        }
    }

    const handleReview = async (docId: number, status: "approved" | "rejected") => {
        setIsSubmittingReview(true)
        try {
            const res = await fetch(`/api/srs/${docId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, comments: reviewComment }),
            })

            if (res.ok) {
                setReviewingId(null)
                setReviewComment("")
                fetchDocs()
            }
        } catch (err) {
            console.error("Review update failed", err)
        } finally {
            setIsSubmittingReview(false)
        }
    }

    const getStatusBadge = (status: SrsDocument["status"]) => {
        switch (status) {
            case "approved":
                return <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1"><CheckCircle2 className="h-3 w-3" /> Approved</Badge>
            case "rejected":
                return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>
            default:
                return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
        }
    }

    return (
        <div className="space-y-6">
            {!isAdmin && (
                <Card className="border-dashed border-primary/30 bg-primary/5">
                    <CardContent className="pt-6">
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="srs-name">Document Label (e.g., Version 1.0)</Label>
                                <Input
                                    id="srs-name"
                                    placeholder="SRS Version 1.0"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="srs-file">Upload SRS Document (PDF only)</Label>
                                <Input
                                    id="srs-file"
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="cursor-pointer file:cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                />
                            </div>
                            <Button type="submit" disabled={!file || uploading} className="w-full gap-2">
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                                {uploading ? "Uploading..." : "Upload SRS Document"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    SRS Submission History
                </h4>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : docs.length === 0 ? (
                    <div className="text-center py-12 border border-dashed rounded-xl bg-muted/20">
                        <p className="text-sm text-muted-foreground">No SRS documents uploaded yet.</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-3">
                            {docs.map((doc) => (
                                <Card key={doc.id} className="border-border/60 hover:border-border transition-colors">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <FileText className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{doc.name}</p>
                                                    <p className="text-xs text-muted-foreground">{format(new Date(doc.uploadDate), "PPP p")}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                {getStatusBadge(doc.status)}
                                                <a
                                                    href={doc.filePath}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                                                >
                                                    <Download className="h-3 w-3" /> View/Download PDF
                                                </a>
                                            </div>
                                        </div>

                                        {doc.comments && (
                                            <div className="bg-muted/50 p-2.5 rounded-lg border border-dashed flex gap-2">
                                                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Guide Comments</p>
                                                    <p className="text-xs text-muted-foreground italic leading-relaxed">{doc.comments}</p>
                                                </div>
                                            </div>
                                        )}

                                        {isAdmin && doc.status === "pending" && (
                                            <div className="pt-2 border-t space-y-3">
                                                {reviewingId === doc.id ? (
                                                    <div className="space-y-3">
                                                        <Textarea
                                                            placeholder="Add feedback or comments for the student..."
                                                            value={reviewComment}
                                                            onChange={(e) => setReviewComment(e.target.value)}
                                                            className="text-xs min-h-[80px]"
                                                        />
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                className="flex-1 bg-success hover:bg-success/90"
                                                                onClick={() => handleReview(doc.id, "approved")}
                                                                disabled={isSubmittingReview}
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                className="flex-1"
                                                                onClick={() => handleReview(doc.id, "rejected")}
                                                                disabled={isSubmittingReview}
                                                            >
                                                                Reject
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => { setReviewingId(null); setReviewComment("") }}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full text-xs h-8"
                                                        onClick={() => {
                                                            setReviewingId(doc.id)
                                                            setReviewComment(doc.comments || "")
                                                        }}
                                                    >
                                                        Review & Verify Document
                                                    </Button>
                                                )}
                                            </div>
                                        )}
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
