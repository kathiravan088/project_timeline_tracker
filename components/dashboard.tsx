"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import type { ProjectStatus } from "@/lib/types"
import type { Project } from "@prisma/client"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatsCards } from "@/components/stats-cards"
import { ProjectCard } from "@/components/project-card"
import { AddProjectDialog } from "@/components/add-project-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, LayoutGrid, List, Calendar, ChevronLeft, ChevronRight, PanelsTopLeft, FolderOpen } from "lucide-react"
import { ProjectAnalytics } from "@/components/project-analytics"
import { TimelineView } from "@/components/timeline-view"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type FilterStatus = "all" | ProjectStatus
type ViewMode = "grid" | "list" | "timeline" | "paging"

export function Dashboard() {
  const { projects, user } = useApp()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterStatus>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("paging")
  const [currentIndex, setCurrentIndex] = useState(0)

  // A helper func to track tab changes across sub-tabs
  const handleTabChange = () => {
    setCurrentIndex(0)
  }

  const isStudent = user?.role === "USER"
  const studentProjects = projects.filter(p => isStudent && p.userId === parseInt(user.id))

  // A student has "My Projects" if they have an active assigned project
  const hasCurrentProject = isStudent && studentProjects.length > 0
  const currentProject = hasCurrentProject ? studentProjects[0] : null
  const isUnassignedStudent = isStudent && !hasCurrentProject

  // Separate regular projects (assigned to someone) from proposals (unassigned)
  const allAssignedProjects = projects.filter(p => !isStudent && p.userId !== null)
  const allProposals = projects.filter(p => p.userId === null)

  const filterProjectsList = (projectList: typeof projects) => {
    return projectList.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.description.toLowerCase().includes(search.toLowerCase())
      const matchesFilter = filter === "all" || project.status === filter
      return matchesSearch && matchesFilter
    })
  }

  const getFilteredProjects = (tabValue: string) => {
    if (isStudent) {
      if (tabValue === "my-projects") return filterProjectsList(studentProjects)
      if (tabValue === "proposals") return filterProjectsList(allProposals)
    } else {
      if (tabValue === "all-projects") return filterProjectsList(allAssignedProjects)
      if (tabValue === "proposals") return filterProjectsList(allProposals)
    }
    return []
  }

  // To maintain compatibility with existing view modes:
  // Render Projects Grid/List/Paging based on the explicitly passed `projectList`
  const renderProjects = (projectList: typeof projects, isProposalsTab = false) => {
    if (projectList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <FolderOpen className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">No projects found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {search || filter !== "all"
                ? "Try adjusting your search or filters."
                : "No projects match the current criteria."}
            </p>
          </div>
        </div>
      )
    }

    if (viewMode === "timeline") return <TimelineView />

    if (viewMode === "paging") {
      const currentPrj = projectList[currentIndex] || projectList[0] // fallback
      return (
        <div className="relative flex flex-col items-center gap-6">
          <div className="flex w-full items-center justify-between gap-4">
            {projectList.length > 1 && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="h-12 w-12 shrink-0 rounded-full border-2 hover:bg-primary/5 hover:text-primary transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}

            <div className={`flex-1 w-full ${projectList.length === 1 ? 'max-w-5xl' : 'max-w-4xl'} transition-all duration-500 ease-in-out transform`}>
              <div key={currentPrj.id} className="animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-700">
                <ProjectCard project={currentPrj} isProposal={isProposalsTab} />
                {isStudent && isProposalsTab && (
                  <div className="mt-10 flex justify-center">
                    <Button
                      variant="default"
                      size="lg"
                      className="w-full max-w-md h-14 text-xl font-bold shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-2xl border-2 border-primary/20"
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/projects/${currentPrj.id}/select`, { method: 'POST' })
                          if (res.ok) window.location.reload()
                          else alert((await res.json()).error || 'Failed to select project')
                        } catch (e) { alert('Network error') }
                      }}
                    >
                      Claim this Project
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {projectList.length > 1 && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentIndex(Math.min(projectList.length - 1, currentIndex + 1))}
                disabled={currentIndex >= projectList.length - 1}
                className="h-12 w-12 shrink-0 rounded-full border-2 hover:bg-primary/5 hover:text-primary transition-colors disabled:opacity-30"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}
          </div>

          {projectList.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground tabular-nums">
                Project {Math.min(currentIndex, projectList.length - 1) + 1} of {projectList.length}
              </span>
              <div className="flex gap-1.5 flex-wrap max-w-md justify-center mt-2">
                {projectList.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground/30 cursor-pointer"
                      }`}
                    onClick={() => setCurrentIndex(idx)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className={viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-4"}>
        {projectList.map((project) => (
          <div key={project.id} className="h-full flex flex-col">
            <ProjectCard project={project} isProposal={isProposalsTab} />
            {isStudent && isProposalsTab && (
              <Button
                variant="default"
                className="w-full mt-4 bg-primary hover:bg-primary/90"
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/projects/${project.id}/select`, { method: 'POST' })
                    if (res.ok) window.location.reload()
                    else alert((await res.json()).error || 'Failed to select project')
                  } catch (e) { alert('Network error') }
                }}
              >
                Claim this Project
              </Button>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Handle Search and Filter Resets identically to before
  const handleFilterChange = (newFilter: FilterStatus) => {
    setFilter(newFilter)
    setCurrentIndex(0)
  }

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setCurrentIndex(0)
  }

  const filterButtons: { value: FilterStatus; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "not-started", label: "Not Started" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ]

  const Toolbar = () => (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="hidden items-center gap-1 rounded-lg border border-border/60 bg-card p-1 sm:flex overflow-x-auto whitespace-nowrap scrollbar-hide">
          {filterButtons.map((btn) => (
            <Button
              key={btn.value}
              variant={filter === btn.value ? "default" : "ghost"}
              size="sm"
              onClick={() => handleFilterChange(btn.value)}
              className="text-xs shrink-0"
            >
              {btn.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-card p-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => { setViewMode("grid"); setCurrentIndex(0) }}
            className="h-8 w-8 p-0"
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => { setViewMode("list"); setCurrentIndex(0) }}
            className="h-8 w-8 p-0"
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "paging" ? "default" : "ghost"}
            size="sm"
            onClick={() => { setViewMode("paging"); setCurrentIndex(0) }}
            className="h-8 w-8 p-0"
            aria-label="Paging view"
          >
            <PanelsTopLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "timeline" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("timeline")}
            className="h-8 w-8 p-0"
            aria-label="Timeline view"
          >
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
        {/* Role-specific Actions */}
        <div className="flex items-center gap-2">
          {user?.role === "FACULTY" && <AddProjectDialog isProposal={true} />}
          {(user?.role === "ADMIN" || user?.role === "FACULTY") && <AddProjectDialog />}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          {/* Page Title */}
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
              {user?.role === "USER" ? "Student Dashboard" : "Faculty Dashboard"}
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                {hasCurrentProject ? "Your Current Project" : "Project Dashboard"}
              </h1>
              {hasCurrentProject && currentProject?.guideName && (
                <span className="text-lg font-medium text-muted-foreground bg-muted/50 px-4 py-1 rounded-full border border-border/40">
                  Guide: <span className="text-foreground font-bold">{currentProject.guideName}</span>
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <StatsCards />

          <Tabs defaultValue={isStudent ? (hasCurrentProject ? "my-projects" : "proposals") : "all-projects"} onValueChange={handleTabChange} className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-muted/50 p-1 border border-border/40 h-10 w-full sm:w-auto grid grid-cols-2">
                <TabsTrigger value={isStudent ? "my-projects" : "all-projects"} className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm font-medium">
                  {isStudent ? "My Projects" : "All Projects"}
                </TabsTrigger>
                <TabsTrigger value="proposals" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm font-medium">
                  {isStudent ? "Available Projects" : "Proposals"}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={isStudent ? "my-projects" : "all-projects"} className="mt-0 outline-none">
              {isStudent && isUnassignedStudent ? (
                <div className="flex flex-col items-center justify-center gap-8 py-20 rounded-3xl border-2 border-dashed border-border bg-card/60 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 shadow-inner">
                    <PanelsTopLeft className="h-12 w-12 text-primary" />
                  </div>
                  <div className="text-center space-y-3 px-4">
                    <h3 className="text-2xl font-bold text-foreground">No Project Selected</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto text-lg">
                      You haven't selected a project yet. Switch to the 'Available Projects' tab to choose one and get started!
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {!isStudent && <ProjectAnalytics />}
                  <Toolbar />
                  {/* Mobile Filters */}
                  <div className="flex flex-wrap gap-2 sm:hidden mb-4">
                    {filterButtons.map((btn) => (
                      <Button key={btn.value} variant={filter === btn.value ? "default" : "outline"} size="sm" onClick={() => handleFilterChange(btn.value)} className="text-xs">
                        {btn.label}
                      </Button>
                    ))}
                  </div>
                  {renderProjects(getFilteredProjects(isStudent ? "my-projects" : "all-projects"), false)}
                </>
              )}
            </TabsContent>

            <TabsContent value="proposals" className="mt-0 outline-none">
              <Toolbar />
              {/* Mobile Filters */}
              <div className="flex flex-wrap gap-2 sm:hidden mb-4">
                {filterButtons.map((btn) => (
                  <Button key={btn.value} variant={filter === btn.value ? "default" : "outline"} size="sm" onClick={() => handleFilterChange(btn.value)} className="text-xs">
                    {btn.label}
                  </Button>
                ))}
              </div>
              {renderProjects(getFilteredProjects("proposals"), true)}
            </TabsContent>

          </Tabs>
        </div>
      </main>
    </div>
  )
}
