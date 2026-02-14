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
import { Calendar, Mail, MoreVertical, Trash2, Clock } from "lucide-react"
import { format, differenceInDays, parseISO } from "date-fns"

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
  }
}

function getTimelineInfo(fromDate: string, toDate: string) {
  const now = new Date()
  const start = parseISO(fromDate)
  const end = parseISO(toDate)
  const totalDays = differenceInDays(end, start)
  const elapsed = differenceInDays(now, start)
  const progress = Math.min(100, Math.max(0, (elapsed / totalDays) * 100))
  const remaining = differenceInDays(end, now)

  return { totalDays, progress, remaining }
}

export function ProjectCard({ project }: { project: Project }) {
  const { updateProjectStatus, deleteProject } = useApp()
  const statusConfig = getStatusConfig(project.status)
  const timeline = getTimelineInfo(project.fromDate, project.toDate)

  return (
    <Card className="group border-border/60 bg-card transition-all hover:border-border hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold leading-tight text-card-foreground">{project.name}</h3>
            <Badge variant="outline" className={statusConfig.className}>
              {statusConfig.label}
            </Badge>
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {project.description}
          </p>
        </div>

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
            <DropdownMenuItem
              onClick={() => deleteProject(project.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
              className={`h-full rounded-full transition-all ${
                project.status === "completed"
                  ? "bg-success"
                  : project.status === "in-progress"
                    ? "bg-primary"
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
            <span>
              {timeline.remaining > 0
                ? `${timeline.remaining} days remaining`
                : timeline.remaining === 0
                  ? "Due today"
                  : `${Math.abs(timeline.remaining)} days overdue`}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            <span className="max-w-[180px] truncate">{project.assignedEmail}</span>
          </div>

          <Select
            value={project.status}
            onValueChange={(value) => updateProjectStatus(project.id, value as ProjectStatus)}
          >
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not-started">Not Started</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
