"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import type { ProjectReview } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar as CalendarIcon, Link as LinkIcon, Award, MessageSquare, Clock, CheckCircle2, AlertCircle, Loader2, Trash2, Plus } from "lucide-react"
import { format } from "date-fns"

export function ReviewSection({ projectId }: { projectId: number }) {
    const { user } = useApp()
    const [reviews, setReviews] = useState<ProjectReview[]>([])
    const [loading, setLoading] = useState(true)
    const [isScheduling, setIsScheduling] = useState(false)
    const [newReview, setNewReview] = useState({
        reviewType: "Review 1",
        reviewDate: "",
        meetLink: ""
    })
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editForm, setEditForm] = useState({
        marks: "",
        comments: "",
        status: "scheduled" as ProjectReview["status"],
        meetLink: "",
        reviewDate: "",
        result: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isAdmin = user?.role === "ADMIN" || user?.role === "FACULTY"

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/reviews`)
            if (res.ok) {
                const data = await res.json()
                setReviews(data)
            }
        } catch (err) {
            console.error("Failed to fetch reviews", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReviews()
    }, [projectId])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/projects/${projectId}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newReview),
            })
            if (res.ok) {
                setNewReview({ reviewType: "Review 1", reviewDate: "", meetLink: "" })
                setIsScheduling(false)
                fetchReviews()
            }
        } catch (err) {
            console.error("Failed to schedule review", err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdate = async (id: number) => {
        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/reviews/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            })
            if (res.ok) {
                setEditingId(null)
                fetchReviews()
            }
        } catch (err) {
            console.error("Failed to update review", err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this review schedule?")) return
        try {
            const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" })
            if (res.ok) fetchReviews()
        } catch (err) {
            console.error("Failed to delete review", err)
        }
    }

    const getStatusBadge = (status: ProjectReview["status"]) => {
        switch (status) {
            case "completed":
                return <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1"><CheckCircle2 className="h-3 w-3" /> Completed</Badge>
            case "delayed":
                return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1"><AlertCircle className="h-3 w-3" /> Delayed</Badge>
            default:
                return <Badge variant="outline" className="bg-info/10 text-info border-info/20 gap-1"><Clock className="h-3 w-3" /> Scheduled</Badge>
        }
    }

    return (
        <div className="space-y-6">
            {isAdmin && !isScheduling && (
                <div className="flex gap-2">
                    <Button onClick={() => { setIsScheduling(true); setNewReview(prev => ({ ...prev, reviewType: "Review 2" })) }} className="flex-1 gap-2 border-dashed" variant="outline">
                        Schedule Review 2
                    </Button>
                    <Button onClick={() => { setIsScheduling(true); setNewReview(prev => ({ ...prev, reviewType: "Review 3" })) }} className="flex-1 gap-2 border-dashed" variant="outline">
                        Schedule Review 3
                    </Button>
                    <Button onClick={() => { setIsScheduling(true); setNewReview(prev => ({ ...prev, reviewType: "Final Viva" })) }} className="flex-1 gap-2 border-dashed" variant="outline">
                        Schedule Final Viva
                    </Button>
                </div>
            )}

            {isAdmin && isScheduling && (
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6 space-y-4">
                        <h4 className="text-sm font-semibold">Schedule Review</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Review Type</Label>
                                <select
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={newReview.reviewType}
                                    onChange={e => setNewReview({ ...newReview, reviewType: e.target.value })}
                                >
                                    <option value="Review 1">Review 1</option>
                                    <option value="Review 2">Review 2</option>
                                    <option value="Review 3">Review 3</option>
                                    <option value="Final Viva">Final Viva</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input
                                    type="datetime-local"
                                    value={newReview.reviewDate}
                                    onChange={e => setNewReview({ ...newReview, reviewDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Meeting Link</Label>
                            <Input
                                placeholder="Google Meet / Zoom URL"
                                value={newReview.meetLink}
                                onChange={e => setNewReview({ ...newReview, meetLink: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleCreate} disabled={isSubmitting} className="flex-1">
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CalendarIcon className="h-4 w-4 mr-2" />}
                                Schedule
                            </Button>
                            <Button variant="ghost" onClick={() => setIsScheduling(false)}>Cancel</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    Review History & Marks
                </h4>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12 border border-dashed rounded-xl bg-muted/20">
                        <p className="text-sm text-muted-foreground">No reviews scheduled yet.</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[450px] pr-4">
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <Card key={review.id} className="border-border/60 hover:border-border transition-colors">
                                    <CardContent className="p-4 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-lg">{review.reviewType}</span>
                                                    {getStatusBadge(review.status)}
                                                    {review.result && (
                                                        <Badge variant="outline" className={review.result === "Pass" ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"}>
                                                            {review.result}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <CalendarIcon className="h-3 w-3" />
                                                        {format(new Date(review.reviewDate), "PPP p")}
                                                    </span>
                                                    {review.meetLink && (
                                                        <a href={review.meetLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                                                            <LinkIcon className="h-3 w-3" />
                                                            Join Meeting
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            {isAdmin && editingId !== review.id && (
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-primary"
                                                        onClick={() => {
                                                            setEditingId(review.id)
                                                            setEditForm({
                                                                marks: review.marks || "",
                                                                comments: review.comments || "",
                                                                status: review.status,
                                                                meetLink: review.meetLink || "",
                                                                reviewDate: format(new Date(review.reviewDate), "yyyy-MM-dd'T'HH:mm"),
                                                                result: review.result || ""
                                                            })
                                                        }}
                                                    >
                                                        <Award className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(review.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {editingId === review.id ? (
                                            <div className="bg-muted/30 p-4 rounded-xl space-y-4 border border-primary/20">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Marks</Label>
                                                        <Input value={editForm.marks} onChange={e => setEditForm({ ...editForm, marks: e.target.value })} placeholder="e.g. 15/20" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Status</Label>
                                                        <select
                                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                            value={editForm.status}
                                                            onChange={e => setEditForm({ ...editForm, status: e.target.value as any })}
                                                        >
                                                            <option value="scheduled">Scheduled</option>
                                                            <option value="completed">Completed</option>
                                                            <option value="delayed">Delayed</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {review.reviewType === "Final Viva" && (
                                                    <div className="space-y-2">
                                                        <Label>Viva Result / Final Status</Label>
                                                        <select
                                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                            value={editForm.result}
                                                            onChange={e => setEditForm({ ...editForm, result: e.target.value })}
                                                        >
                                                            <option value="">Select Result</option>
                                                            <option value="Pass">Pass</option>
                                                            <option value="Rework">Rework</option>
                                                        </select>
                                                    </div>
                                                )}

                                                <div className="space-y-2">
                                                    <Label>Comments</Label>
                                                    <Textarea value={editForm.comments} onChange={e => setEditForm({ ...editForm, comments: e.target.value })} placeholder="Add feedback..." className="min-h-[100px]" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button onClick={() => handleUpdate(review.id)} disabled={isSubmitting} size="sm" className="flex-1">Save Changes</Button>
                                                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                <div className="bg-success/5 border border-success/10 p-3 rounded-lg">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Award className="h-3.5 w-3.5 text-success" />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-success/70">Marks Awarded</span>
                                                    </div>
                                                    <p className="text-xl font-bold text-success">{review.marks || "Not graded"}</p>
                                                </div>
                                                <div className="bg-primary/5 border border-primary/10 p-3 rounded-lg">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <MessageSquare className="h-3.5 w-3.5 text-primary" />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">Guide Comments</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground italic leading-relaxed">{review.comments || "No comments yet."}</p>
                                                </div>
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
