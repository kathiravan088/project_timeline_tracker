"use client"

import { useApp } from "@/lib/app-context"
import type { Project, ProjectStatus } from "@/lib/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar, Mail, MoreVertical, Trash2, Clock, Users, FileText, MessageSquareText, UserCog, Code } from "lucide-react"
import { format, differenceInDays, parseISO, intervalToDuration, isPast } from "date-fns"
import { useEffect, useState } from "react"

function getStatusConfig(status: ProjectStatus) {
  switch (status) {
    case "not-started":
      return {
        label: "Not Started",
        className: "bg-muted text-muted-foreground border-border",
      }
    case "in-progress":
      return {
        label: "In Progress",
        className: "bg-primary/10 text-primary border-primary/20",
      }
    case "completed":
      return {
        label: "Completed",
        className: "bg-success/10 text-success border-success/20",
      }
    case "pending":
      return {
        label: "Pending",
        className: "bg-warning/10 text-warning border-warning/20",
      }
    case "approved":
      return {
        label: "Approved",
        className: "bg-primary/10 text-primary border-primary/20",
      }
    case "rejected":
      return {
        label: "Rejected",
        className: "bg-destructive/10 text-destructive border-destructive/20",
      }
  }
}

function getTimelineInfo(fromDate: string, toDate: string) {
  const now = new Date()
  const start = parseISO(fromDate)
  const end = parseISO(toDate)
  const totalDays = differenceInDays(end, start)
  const elapsed = differenceInDays(now, start)
  const progress = Math.min(100, Math.max(0, (elapsed / totalDays) * 100))
  // remaining is calculated live in Countdown component for display, 
  // but we keep a static one here for progress calculation if needed
  const remaining = differenceInDays(end, now)

  return { totalDays, progress, remaining }
}

function Countdown({ toDate }: { toDate: string }) {
  const [timeLeft, setTimeLeft] = useState("")
  const [isOverdue, setIsOverdue] = useState(false)

  useEffect(() => {
    const targetDate = parseISO(toDate)

    const updateTimer = () => {
      const now = new Date()
      if (isPast(targetDate)) {
        setIsOverdue(true)
        const totalDays = differenceInDays(now, targetDate)
        const duration = intervalToDuration({ start: targetDate, end: now })
        setTimeLeft(formatDuration(totalDays, duration))
        return
      }

      setIsOverdue(false)
      const totalDays = differenceInDays(targetDate, now)
      const duration = intervalToDuration({ start: now, end: targetDate })
      setTimeLeft(formatDuration(totalDays, duration))
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [toDate])

  const formatDuration = (totalDays: number, duration: ReturnType<typeof intervalToDuration>) => {
    const parts = []
    if (totalDays) parts.push(`${totalDays}d`)
    if (duration.hours) parts.push(`${duration.hours}h`)
    if (duration.minutes) parts.push(`${duration.minutes}m`)
    if (duration.seconds) parts.push(`${duration.seconds}s`)

    // Show only top 2 significant units to avoid clutter if long duration
    if (parts.length === 0) return "Due now"
    return parts.slice(0, 3).join(" ")
  }

  return (
    <span className={`${isOverdue ? "text-destructive font-medium" : "text-primary"}`}>
      {isOverdue ? `Overdue by ${timeLeft}` : `${timeLeft} remaining`}
    </span>
  )
}

import { EditProjectDialog } from "./edit-project-dialog"

export function ProjectCard({ project, isProposal = false }: { project: Project; isProposal?: boolean }) {
  const { updateProjectStatus, deleteProject, user } = useApp()
  const statusConfig = getStatusConfig(project.status)
  const timeline = getTimelineInfo(project.fromDate, project.toDate)

  if (isProposal) {
    return (
      <Card className="group border-border/60 bg-card transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 rounded-2xl overflow-hidden border-2">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/40" />
        <CardHeader className="pb-2 pt-8 px-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-semibold px-3 py-1 uppercase tracking-wider text-[10px]">
                Open Proposal
              </Badge>
            </div>
            <h3 className="text-2xl font-bold leading-tight text-card-foreground tracking-tight">{project.name}</h3>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-10 pt-4 flex flex-col gap-8">
          <div className="space-y-3">
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <MessageSquareText className="h-3 w-3" />
              Problem Statement
            </h5>
            <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-wrap line-clamp-[6]">
              {project.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border/40">
            {project.guideName && (
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <UserCog className="h-3 w-3" />
                  Guide / Faculty
                </h5>
                <p className="text-sm font-semibold text-foreground">{project.guideName}</p>
              </div>
            )}
            {project.maxStudents && (
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  Capacity
                </h5>
                <p className="text-sm font-semibold text-foreground">{project.maxStudents} Students Max</p>
              </div>
            )}
            {project.technologies && (
              <div className="col-span-2 space-y-3">
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Code className="h-3 w-3" />
                  Technologies
                </h5>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.split(',').map((tech, i) => (
                    <Badge key={i} variant="secondary" className="bg-primary/5 text-primary border-primary/10 hover:bg-primary/10 transition-colors">
                      {tech.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`group border-border/60 bg-card transition-all hover:border-border hover:shadow-md ${project.status === "in-progress" ? "hover:glow-primary" : project.status === "completed" ? "hover:glow-success" : ""
      }`}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold leading-tight text-card-foreground">{project.name}</h3>
            <Badge variant="outline" className={statusConfig.className}>
              {statusConfig.label}
            </Badge>
            {project.status === "in-progress" && (
              <div className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </div>
            )}
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {project.description}
          </p>
        </div>

        {(user?.role === "ADMIN" || user?.role === "FACULTY") && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="p-1">
                <EditProjectDialog project={project} />
              </div>
              <DropdownMenuItem
                onClick={() => deleteProject(project.id.toString())}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Timeline Progress */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {format(parseISO(project.fromDate), "MMM d, yyyy")}
            </span>
            <span>{format(parseISO(project.toDate), "MMM d, yyyy")}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${project.status === "completed" || project.status === "approved"
                ? "bg-success"
                : project.status === "in-progress"
                  ? "bg-primary"
                  : project.status === "pending"
                    ? "bg-warning"
                    : "bg-muted-foreground/30"
                }`}
              style={{
                width: project.status === "completed" ? "100%" : `${timeline.progress}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {timeline.totalDays} days total
            </span>
            {project.status === "completed" ? (
              <span className="text-success font-medium">Completed</span>
            ) : (
              <Countdown toDate={project.toDate} />
            )}
          </div>
        </div>

        {/* Team Members */}
        {project.teamMembers && project.teamMembers.length > 0 && (
          <div className="flex flex-col gap-2 bg-muted/30 p-2.5 rounded-lg border border-dashed">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              <Users className="h-3 w-3" />
              Team Members ({project.teamMembers.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {project.teamMembers.map((member, index) => (
                <Badge
                  key={member.id || `${member.employeeId}-${index}`}
                  variant="outline"
                  className="bg-background/80 text-[10px] font-normal py-0 px-2 h-5 border-border/50"
                  title={`${member.name} (${member.employeeId})`}
                >
                  {member.name} ({member.employeeId})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col gap-2 border-t border-border/60 pt-3">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate" title={project.assignedEmail || ""}>{project.assignedEmail || "No email assigned"}</span>
          </div>
          {(project.assignedName || project.assignedId) && (
            <div className="flex items-center gap-2 text-[10px] font-medium ml-2">
              {project.assignedName && <span className="truncate max-w-[100px] border-l border-border/60 pl-2">{project.assignedName}</span>}
              {project.assignedId && <span className="bg-muted px-1.5 py-0.5 rounded uppercase tracking-wider">{project.assignedId}</span>}
            </div>
          )}
        </div>

        <Select
          value={project.status}
          onValueChange={(value) => updateProjectStatus(project.id.toString(), value as ProjectStatus)}
          disabled={user?.role !== "ADMIN" && user?.role !== "FACULTY"}
        >
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="not-started">Not Started</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

      </CardContent>
    </Card>
  )
}
