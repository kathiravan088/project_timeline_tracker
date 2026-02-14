"use client"

import { useApp } from "@/lib/app-context"
import { Card, CardContent } from "@/components/ui/card"
import { FolderOpen, CircleDashed, Loader, CheckCircle2 } from "lucide-react"

export function StatsCards() {
  const { projects } = useApp()

  const total = projects.length
  const notStarted = projects.filter((p) => p.status === "not-started").length
  const inProgress = projects.filter((p) => p.status === "in-progress").length
  const completed = projects.filter((p) => p.status === "completed").length

  const stats = [
    {
      label: "Total Projects",
      value: total,
      icon: FolderOpen,
      iconClassName: "text-primary bg-primary/10",
    },
    {
      label: "Not Started",
      value: notStarted,
      icon: CircleDashed,
      iconClassName: "text-muted-foreground bg-muted",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: Loader,
      iconClassName: "text-primary bg-primary/10",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle2,
      iconClassName: "text-success bg-success/10",
    },
  ]

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
