"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, Clock, CheckCircle2, AlertCircle, MapPin } from "lucide-react"
import { format, differenceInDays, parseISO, isAfter, isBefore, startOfDay, addDays } from "date-fns"
import type { Project, ProjectReview } from "@/lib/types"

export function TimelineSection({ project }: { project: Project }) {
    const startDate = new Date(project.fromDate)
    const endDate = new Date(project.toDate)
    const today = startOfDay(new Date())
    const daysPassed = differenceInDays(today, startDate)
    const totalDays = Math.max(1, differenceInDays(endDate, startDate))

    const milestones = [
        { day: 0, label: "Project Start", type: "start" },
        { day: Math.floor(totalDays * 0.25), label: "Review 1", type: "review" },
        { day: Math.floor(totalDays * 0.60), label: "Review 2", type: "review" },
        { day: Math.floor(totalDays * 0.90), label: "Review 3", type: "review" },
        { day: totalDays, label: "Final Viva", type: "viva" },
    ]

    const numWeeks = Math.ceil(totalDays / 7)
    const weeks = Array.from({ length: numWeeks }, (_, i) => {
        const startDay = i * 7
        const endDay = Math.min((i + 1) * 7 - 1, totalDays)
        return {
            id: i + 1,
            label: `Week ${i + 1}`,
            startDay,
            endDay,
        }
    })

    const getDayStatus = (milestoneDay: number) => {
        if (daysPassed > milestoneDay) return "completed"
        if (daysPassed === milestoneDay) return "active"
        return "upcoming"
    }

    const getWeekStatus = (start: number, end: number) => {
        if (daysPassed > end) return "completed"
        if (daysPassed >= start && daysPassed <= end) return "active"
        return "upcoming"
    }

    const getReviewForMilestone = (label: string) => {
        return project.reviews?.find(r => r.reviewType === label)
    }

    return (
        <div className="space-y-6">
            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                        <h4 className="font-bold flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            Progress Tracker
                        </h4>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                            {daysPassed < 0 ? "Starting in " + Math.abs(daysPassed) + " days" : `Day ${daysPassed} of ${totalDays}`}
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs font-bold bg-background">
                        {Math.max(0, Math.min(100, Math.round((daysPassed / totalDays) * 100)))}% Complete
                    </Badge>
                </div>

                {/* Progress Bar */}
                <div className="relative h-3 bg-muted rounded-full overflow-hidden border border-border/50">
                    <div
                        className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-in-out"
                        style={{ width: `${Math.max(0, Math.min(100, (daysPassed / totalDays) * 100))}%` }}
                    />
                </div>
            </div>

            <ScrollArea className="h-[450px] pr-4">
                <div className="space-y-8">
                    {weeks.map((week) => {
                        const weekStatus = getWeekStatus(week.startDay, week.endDay)
                        const weekMilestones = milestones.filter(m => m.day >= week.startDay && m.day <= week.endDay)

                        return (
                            <div key={week.id} className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${weekStatus === "completed" ? "bg-success/10 text-success border border-success/20" :
                                        weekStatus === "active" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                                        }`}>
                                        {week.id}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-sm">{week.label}</h4>
                                            <Badge variant="outline" className={`text-[10px] ${weekStatus === "completed" ? "text-success border-success/20 bg-success/5" :
                                                weekStatus === "active" ? "text-primary border-primary/20 bg-primary/5" : ""
                                                }`}>
                                                {week.startDay}-{week.endDay} Days
                                            </Badge>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">
                                            {format(addDays(startDate, week.startDay), "MMM d")} - {format(addDays(startDate, week.endDay), "MMM d")}
                                        </p>
                                    </div>
                                </div>

                                <div className="ml-4 pl-8 border-l-2 border-dashed border-border/60 space-y-6">
                                    {weekMilestones.length === 0 ? (
                                        <p className="text-[10px] text-muted-foreground italic py-2">Regular development and daily logs...</p>
                                    ) : (
                                        weekMilestones.map((milestone) => {
                                            const status = getDayStatus(milestone.day)
                                            const milestoneDate = addDays(startDate, milestone.day)
                                            const review = getReviewForMilestone(milestone.label)

                                            return (
                                                <div key={milestone.day} className="relative">
                                                    {/* Timeline Dot */}
                                                    <div className={`absolute -left-[41px] top-1.5 h-3.5 w-3.5 rounded-full border-2 bg-background z-10 ${status === "completed" ? "border-success bg-success" :
                                                        status === "active" ? "border-primary animate-pulse" : "border-muted-foreground/30"
                                                        }`}>
                                                        {status === "completed" && <CheckCircle2 className="h-2.5 w-2.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h5 className={`font-bold text-xs ${status === "active" ? "text-primary" : ""}`}>
                                                                    {milestone.label}
                                                                </h5>
                                                                <p className="text-[10px] text-muted-foreground">
                                                                    Day {milestone.day} • {format(milestoneDate, "PPP")}
                                                                </p>
                                                            </div>
                                                            {review ? (
                                                                <Badge variant="outline" className={`text-[9px] ${review.status === "completed" ? "bg-success/10 text-success border-success/20" : "bg-info/10 text-info border-info/20"}`}>
                                                                    {review.status}
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="text-[9px] opacity-40">Planned</Badge>
                                                            )}
                                                        </div>

                                                        {review && (
                                                            <Card className="bg-muted/30 border-none shadow-none">
                                                                <CardContent className="p-3 space-y-2">
                                                                    {review.meetLink && status !== "completed" && (
                                                                        <a href={review.meetLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] text-primary hover:underline">
                                                                            <MapPin className="h-3 w-3" />
                                                                            Join meeting
                                                                        </a>
                                                                    )}
                                                                    {review.marks && (
                                                                        <div className="flex items-center gap-2 text-[10px] font-semibold">
                                                                            <span className="text-muted-foreground uppercase text-[8px]">Marks:</span>
                                                                            <span className="text-success">{review.marks}</span>
                                                                        </div>
                                                                    )}
                                                                    {review.comments && (
                                                                        <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                                                                            "{review.comments.substring(0, 100)}{review.comments.length > 100 ? "..." : ""}"
                                                                        </p>
                                                                    )}
                                                                </CardContent>
                                                            </Card>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </ScrollArea>
        </div>
    )
}
