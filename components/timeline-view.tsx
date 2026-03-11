"use client"

import { useApp } from "@/lib/app-context"
import { parseISO, format, differenceInDays, startOfMonth, endOfMonth, eachMonthOfInterval, isWithinInterval, addMonths, subMonths } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function TimelineView() {
    const { projects } = useApp()
    const [viewDate, setViewDate] = useState(new Date())

    const months = eachMonthOfInterval({
        start: subMonths(viewDate, 2),
        end: addMonths(viewDate, 3),
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "bg-success"
            case "in-progress": return "bg-primary"
            default: return "bg-muted-foreground/30"
        }
    }

    return (
        <Card className="border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
                <div className="flex items-center justify-between p-4 border-b border-border/60">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-sm">Project Timeline</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewDate(subMonths(viewDate, 1))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs font-medium min-w-[100px] text-center">
                            {format(months[0], "MMM yyyy")} - {format(months[months.length - 1], "MMM yyyy")}
                        </span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewDate(addMonths(viewDate, 1))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <div className="min-w-[800px] p-6">
                        {/* Timeline Header (Months) */}
                        <div className="grid grid-cols-6 mb-4 border-b border-border/40 pb-2">
                            {months.map((month) => (
                                <div key={month.toString()} className="text-center text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                    {format(month, "MMMM")}
                                </div>
                            ))}
                        </div>

                        {/* Project Bars */}
                        <div className="space-y-4">
                            {projects.length === 0 ? (
                                <p className="text-center text-sm text-muted-foreground py-8">No projects to display in timeline.</p>
                            ) : (
                                projects.map((project) => {
                                    const startDate = parseISO(project.fromDate)
                                    const endDate = parseISO(project.toDate)
                                    const timelineStart = startOfMonth(months[0])
                                    const timelineEnd = endOfMonth(months[months.length - 1])

                                    // Calculate position (very simplified percentage based)
                                    const totalDays = differenceInDays(timelineEnd, timelineStart)
                                    const startOffset = Math.max(0, differenceInDays(startDate, timelineStart))
                                    const duration = differenceInDays(endDate, startDate)

                                    const left = (startOffset / totalDays) * 100
                                    const width = (duration / totalDays) * 100

                                    if (left >= 100 || left + width <= 0) return null

                                    return (
                                        <div key={project.id} className="relative h-12 flex items-center">
                                            <div
                                                className={`absolute h-8 rounded-lg ${getStatusColor(project.status)} opacity-80 hover:opacity-100 transition-all cursor-pointer group flex items-center px-3 shadow-sm border border-white/10`}
                                                style={{
                                                    left: `${Math.max(0, left)}%`,
                                                    width: `${Math.min(100 - left, width)}%`,
                                                    minWidth: '120px'
                                                }}
                                            >
                                                <span className="text-[11px] font-bold text-white truncate drop-shadow-sm">
                                                    {project.name}
                                                </span>

                                                {/* Tooltip-like effect on bar hover could be added here */}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
