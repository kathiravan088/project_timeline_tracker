"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import type { ProjectStatus } from "@/lib/types"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatsCards } from "@/components/stats-cards"
import { ProjectCard } from "@/components/project-card"
import { AddProjectDialog } from "@/components/add-project-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, LayoutGrid, List, FolderOpen } from "lucide-react"

type FilterStatus = "all" | ProjectStatus

export function Dashboard() {
  const { projects } = useApp()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterStatus>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "all" || project.status === filter
    return matchesSearch && matchesFilter
  })

  const filterButtons: { value: FilterStatus; label: string }[] = [
    { value: "all", label: "All" },
    { value: "not-started", label: "Not Started" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          {/* Page Title */}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Project Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage and track all your projects in one place.
            </p>
          </div>

          {/* Stats */}
          <StatsCards />

          {/* Toolbar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="hidden items-center gap-1 rounded-lg border border-border/60 bg-card p-1 sm:flex">
                {filterButtons.map((btn) => (
                  <Button
                    key={btn.value}
                    variant={filter === btn.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter(btn.value)}
                    className="text-xs"
                  >
                    {btn.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-card p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <AddProjectDialog />
            </div>
          </div>

          {/* Mobile Filters */}
          <div className="flex flex-wrap gap-2 sm:hidden">
            {filterButtons.map((btn) => (
              <Button
                key={btn.value}
                variant={filter === btn.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(btn.value)}
                className="text-xs"
              >
                {btn.label}
              </Button>
            ))}
          </div>

          {/* Projects Grid/List */}
          {filteredProjects.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  : "flex flex-col gap-4"
              }
            >
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <FolderOpen className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">No projects found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search || filter !== "all"
                    ? "Try adjusting your search or filters."
                    : "Get started by creating your first project."}
                </p>
              </div>
              {!search && filter === "all" && <AddProjectDialog />}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
