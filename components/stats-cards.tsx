"use client"

import { useApp } from "@/lib/app-context"
import { Card, CardContent } from "@/components/ui/card"
import { FolderOpen, CircleDashed, CheckCircle2, Users, Calendar, ClipboardCheck, Clock } from "lucide-react"

export function StatsCards() {
  const { projects, user } = useApp()

  const isFaculty = user?.role === "FACULTY" || user?.role === "ADMIN"

  // Faculty Stats
  const facultyStats = [
    {
      label: "Total Projects",
      value: projects.length,
      icon: FolderOpen,
      iconClassName: "text-primary bg-primary/10",
    },
    {
      label: "Assigned Students",
      value: projects.filter(p => !!p.userId).length,
      icon: Users,
      iconClassName: "text-success bg-success/10",
    },
    {
      label: "Upcoming Reviews",
      value: projects.reduce((acc, p) => acc + (p.reviews?.filter(r => r.status === "scheduled").length || 0), 0),
      icon: Calendar,
      iconClassName: "text-warning bg-warning/10",
    },
    {
      label: "Pending Approvals",
      value: projects.filter(p => p.status === "pending").length,
      icon: ClipboardCheck,
      iconClassName: "text-info bg-info/10",
    },
  ]

  // Student Stats
  const studentProjects = projects.filter(p => p.userId === (user?.id ? parseInt(user.id) : null))
  const currentProject = studentProjects[0]

  const studentStats = [
    {
      label: "Your Projects",
      value: studentProjects.length,
      icon: FolderOpen,
      iconClassName: "text-primary bg-primary/10",
    },
    {
      label: "Project Status",
      value: currentProject?.status?.replace("-", " ") || "No Project",
      icon: CircleDashed,
      iconClassName: "text-warning bg-warning/10",
    },
    {
      label: "Days Remaining",
      value: currentProject ? Math.max(0, Math.ceil((new Date(currentProject.toDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0,
      icon: Clock,
      iconClassName: "text-success bg-success/10",
    },
    {
      label: "Completed",
      value: studentProjects.filter(p => p.status === "completed").length,
      icon: CheckCircle2,
      iconClassName: "text-info bg-info/10",
    },
  ]

  const stats = isFaculty ? facultyStats : studentStats

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/60 bg-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.iconClassName}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
