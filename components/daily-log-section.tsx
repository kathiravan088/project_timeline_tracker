"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { DailyLog } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { format, parseISO } from "date-fns"
import { MessageSquare, Calendar, User, Send, Loader2, Users } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export function DailyLogSection({ projectId }: { projectId: number }) {
    const { user } = useApp()
    const [logs, setLogs] = useState<DailyLog[]>([])
    const [teamMembers, setTeamMembers] = useState<{ id: number; name: string; employeeId: string }[]>([])
    const [selectedMemberId, setSelectedMemberId] = useState<string>("")
    const [content, setContent] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)

    const fetchLogs = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/logs`)
            if (res.ok) {
                const data = await res.json()
                setLogs(data)
            }
        } catch (error) {
            console.error("Failed to fetch logs", error)
        }
    }

    const fetchProjectDetails = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}`)
            if (res.ok) {
                const data = await res.json()
                setTeamMembers(data.teamMembers || [])
            }
        } catch (error) {
            console.error("Failed to fetch project details", error)
        } finally {
            setIsFetching(false)
        }
    }

    useEffect(() => {
        fetchLogs()
        fetchProjectDetails()
    }, [projectId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setIsLoading(true)
        try {
            const res = await fetch(`/api/projects/${projectId}/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: content.trim(),
                    teamMemberId: selectedMemberId ? parseInt(selectedMemberId) : null
                }),
            })

            if (res.ok) {
                const newLog = await res.json()
                setLogs((prev) => [newLog, ...prev])
                setContent("")
                setSelectedMemberId("")
            }
        } catch (error) {
            console.error("Failed to add log", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Update Daily Log</h3>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <div className="space-y-3">
                    <Textarea
                        placeholder="What did you work on today?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[80px] bg-background/50"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 max-w-xs w-full">
                            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                            <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Associate with team member..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">General project log</SelectItem>
                                    {teamMembers.map((member, index) => (
                                        <SelectItem key={member.id || `select-${member.employeeId}-${index}`} value={member.id.toString()}>
                                            {member.name} ({member.employeeId})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end">
                            <Button size="sm" type="submit" disabled={isLoading || !content.trim()}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                                Post Update
                            </Button>
                        </div>
                    </div>
                </div>
            </form>

            {(user?.role === "ADMIN" || user?.role === "FACULTY") && (
                <div className="space-y-3 mt-6">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Log History</h4>
                    {isFetching ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : logs.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-8 border border-dashed rounded-lg">
                            No updates yet. Be the first to post!
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {logs.map((log) => (
                                <div key={log.id} className="relative pl-6 border-l-2 border-primary/20 pb-4 last:pb-0">
                                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-background border-2 border-primary" />
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                    <User className="h-3 w-3" />
                                                    {log.user?.name || "Member"}
                                                </span>
                                                {log.teamMember && (
                                                    <Badge variant="secondary" className="text-[9px] h-4 mt-0.5 px-1 py-0 w-fit">
                                                        {log.teamMember.name} ({log.teamMember.employeeId})
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(log.date), "MMM d, h:mm a")}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap mt-0.5">
                                            {log.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
