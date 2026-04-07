"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { useNav } from "@/lib/nav-context"
import type { ProjectStatus } from "@/lib/types"
import type { Project } from "@/lib/types"
import { ProjectCard } from "@/components/project-card"
import { AddProjectDialog } from "@/components/add-project-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StatsCards } from "@/components/stats-cards"
import { ProjectAnalytics } from "@/components/project-analytics"
import { TimelineView } from "@/components/timeline-view"
import { DailyLogSection } from "@/components/daily-log-section"
import { SrsSection } from "@/components/srs-section"
import { DocumentSection } from "@/components/document-section"
import { ReviewSection } from "@/components/review-section"
import { TimelineSection } from "@/components/timeline-section"
import {
  Search,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  PanelsTopLeft,
  FolderOpen,
  Calendar,
  CalendarRange,
  MessageSquare,
  FileText,
  Award,
  Folders,
  FolderKanban,
  Lightbulb,
  BookUser,
  BarChart3,
  Plus,
} from "lucide-react"

type FilterStatus = "all" | ProjectStatus
type ViewMode = "grid" | "list" | "paging"

// ─── Section: Overview ────────────────────────────────────────────────────────
function OverviewSection() {
  const { user } = useApp()
  const isStudent = user?.role === "USER"
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          {isStudent ? "Student Dashboard" : "Faculty Dashboard"}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground text-sm">Here's what's happening with your projects today.</p>
      </div>
      <StatsCards />
      {!isStudent && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Project Analytics
          </h2>
          <ProjectAnalytics />
        </div>
      )}
    </div>
  )
}

// ─── Section: Project List (generic) ─────────────────────────────────────────
function ProjectListSection({
  title,
  icon: Icon,
  projects,
  isProposals = false,
  emptyMessage,
  color = "text-primary",
  renderItem,
}: {
  title: string
  icon: React.ElementType
  projects: Project[]
  isProposals?: boolean
  emptyMessage?: string
  color?: string
  renderItem?: (project: Project) => React.ReactNode
}) {
  const { user } = useApp()
  const isStudent = user?.role === "USER"
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterStatus>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("paging")
  const [currentIndex, setCurrentIndex] = useState(0)

  const filterButtons: { value: FilterStatus; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "not-started", label: "Not Started" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ]

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "all" || p.status === filter
    return matchesSearch && matchesFilter
  })

  useEffect(() => { setCurrentIndex(0) }, [search, filter, viewMode])

  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <FolderOpen className="h-7 w-7 text-muted-foreground" />
      </div>
      <div>
        <p className="font-semibold text-foreground">No projects found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {search || filter !== "all" ? "Try adjusting your search or filters." : (emptyMessage || "No projects match the current criteria.")}
        </p>
      </div>
    </div>
  )

  const renderCards = () => {
    if (filtered.length === 0) return renderEmpty()

    if (viewMode === "paging") {
      const cur = filtered[currentIndex] || filtered[0]
      return (
        <div className="flex flex-col items-center gap-6">
          <div className="flex w-full items-center justify-between gap-4">
            {filtered.length > 1 && (
              <Button variant="outline" size="icon" onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}
                className="h-12 w-12 shrink-0 rounded-full border-2 hover:bg-primary/5 hover:text-primary transition-colors disabled:opacity-30">
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}
            <div className={`flex-1 w-full ${filtered.length === 1 ? "max-w-5xl" : "max-w-4xl"} transition-all duration-500`}>
              <div key={cur.id} className="animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-700 w-full">
                {renderItem ? renderItem(cur) : (
                  <>
                    <ProjectCard project={cur} isProposal={isProposals} />
                    {isStudent && isProposals && (
                      <div className="mt-10 flex justify-center">
                        <Button variant="default" size="lg"
                          className="w-full max-w-md h-14 text-xl font-bold shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-2xl"
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/projects/${cur.id}/select`, { method: "POST" })
                              if (res.ok) window.location.reload()
                              else alert((await res.json()).error || "Failed to select project")
                            } catch { alert("Network error") }
                          }}>
                          Claim this Project
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            {filtered.length > 1 && (
              <Button variant="outline" size="icon" onClick={() => setCurrentIndex(Math.min(filtered.length - 1, currentIndex + 1))} disabled={currentIndex >= filtered.length - 1}
                className="h-12 w-12 shrink-0 rounded-full border-2 hover:bg-primary/5 hover:text-primary transition-colors disabled:opacity-30">
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}
          </div>
          {filtered.length > 1 && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground tabular-nums">
                Project {currentIndex + 1} of {filtered.length}
              </span>
              <div className="flex gap-1.5 flex-wrap max-w-md justify-center">
                {filtered.map((_, idx) => (
                  <div key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground/30"}`}
                    onClick={() => setCurrentIndex(idx)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className={viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-4"}>
        {filtered.map((project) => (
          <div key={project.id} className="flex flex-col gap-3">
            {renderItem ? renderItem(project) : (
              <>
                <ProjectCard project={project} isProposal={isProposals} />
                {isStudent && isProposals && (
                  <Button variant="default" className="w-full bg-primary hover:bg-primary/90"
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/projects/${project.id}/select`, { method: "POST" })
                        if (res.ok) window.location.reload()
                        else alert((await res.json()).error || "Failed")
                      } catch { alert("Network error") }
                    }}>
                    Claim this Project
                  </Button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Icon className={`h-5 w-5 ${color}`} />
          {title}
          <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{filtered.length}</span>
        </h2>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card border border-border/60 rounded-xl px-4 py-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search projects…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-9" />
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-lg border border-border/60 bg-background p-1 sm:flex overflow-x-auto whitespace-nowrap scrollbar-hide">
            {filterButtons.map((btn) => (
              <Button key={btn.value} variant={filter === btn.value ? "default" : "ghost"} size="sm"
                onClick={() => { setFilter(btn.value); setCurrentIndex(0) }} className="text-xs shrink-0 h-7">
                {btn.label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background p-1">
            {([["paging", PanelsTopLeft], ["grid", LayoutGrid], ["list", List]] as const).map(([mode, IcoComp]) => (
              <Button key={mode} variant={viewMode === mode ? "default" : "ghost"} size="sm"
                onClick={() => { setViewMode(mode as ViewMode); setCurrentIndex(0) }} className="h-8 w-8 p-0">
                <IcoComp className="h-3.5 w-3.5" />
              </Button>
            ))}
          </div>
        </div>
      </div>

      {renderCards()}
    </div>
  )
}

// ─── Section: Timeline & Schedule ─────────────────────────────────────────────
function TimelineScheduleSection() {
  const { projects, user } = useApp()
  const isStudent = user?.role === "USER"
  const myProjects = isStudent
    ? projects.filter(p => p.userId === parseInt(user!.id))
    : projects.filter(p => p.userId !== null)

  const [showGraphId, setShowGraphId] = useState<number | null>(null)

  return (
    <ProjectListSection
      title="Timeline & Schedule"
      icon={CalendarRange}
      color="text-violet-500"
      projects={myProjects}
      emptyMessage="No active projects to show timeline for."
      renderItem={(p) => (
        <div key={p.id} className="rounded-2xl border border-border/60 bg-card overflow-hidden w-full">
          {/* Project Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-violet-500" /> {p.name}
            </h3>
            <Button
              variant={showGraphId === p.id ? "default" : "outline"}
              size="sm"
              className={`gap-2 text-xs transition-all ${showGraphId === p.id
                ? "bg-violet-600 hover:bg-violet-700 text-white border-violet-600"
                : "border-violet-300 text-violet-600 hover:bg-violet-50 hover:border-violet-500"
                }`}
              onClick={() => setShowGraphId(showGraphId === p.id ? null : p.id)}
            >
              <CalendarRange className="h-3.5 w-3.5" />
              {showGraphId === p.id ? "Hide Month Graph" : "Show Month Graph"}
            </Button>
          </div>

          {/* Month-wise Graph (toggleable) */}
          {showGraphId === p.id && (
            <div className="border-b border-border/50 bg-muted/20 animate-in slide-in-from-top-2 duration-300">
              <TimelineView />
            </div>
          )}

          {/* Per-project Timeline Details */}
          <div className="p-6">
            <TimelineSection project={p} />
          </div>
        </div>
      )}
    />
  )
}

// ─── Section: Daily Logs ───────────────────────────────────────────────────────
function DailyLogsPageSection() {
  const { projects, user } = useApp()
  const isStudent = user?.role === "USER"
  const myProjects = isStudent
    ? projects.filter(p => p.userId === parseInt(user!.id))
    : projects.filter(p => p.userId !== null)

  return (
    <ProjectListSection
      title="Daily Logs"
      icon={MessageSquare}
      color="text-sky-500"
      projects={myProjects}
      emptyMessage="No active projects found for daily logs."
      renderItem={(p) => (
        <div key={p.id} className="rounded-2xl border border-border/60 bg-card p-6 w-full">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-sky-500" /> {p.name}
          </h3>
          <DailyLogSection projectId={p.id} />
        </div>
      )}
    />
  )
}

// ─── Section: SRS Documents ───────────────────────────────────────────────────
function SrsPageSection() {
  const { projects, user } = useApp()
  const isStudent = user?.role === "USER"
  const myProjects = isStudent
    ? projects.filter(p => p.userId === parseInt(user!.id))
    : projects.filter(p => p.userId !== null)

  return (
    <ProjectListSection
      title="SRS Documents"
      icon={FileText}
      color="text-emerald-500"
      projects={myProjects}
      emptyMessage="No active projects found for SRS documents."
      renderItem={(p) => (
        <div key={p.id} className="rounded-2xl border border-border/60 bg-card p-6 w-full">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-500" /> {p.name}
          </h3>
          <SrsSection projectId={p.id} />
        </div>
      )}
    />
  )
}

// ─── Section: Project Docs ────────────────────────────────────────────────────
function DocsPageSection() {
  const { projects, user } = useApp()
  const isStudent = user?.role === "USER"
  const myProjects = isStudent
    ? projects.filter(p => p.userId === parseInt(user!.id))
    : projects.filter(p => p.userId !== null)

  return (
    <ProjectListSection
      title="Project Docs"
      icon={Folders}
      color="text-amber-500"
      projects={myProjects}
      emptyMessage="No active projects found for documents."
      renderItem={(p) => (
        <div key={p.id} className="rounded-2xl border border-border/60 bg-card p-6 w-full">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Folders className="h-4 w-4 text-amber-500" /> {p.name}
          </h3>
          <DocumentSection projectId={p.id} />
        </div>
      )}
    />
  )
}

// ─── Section: Reviews & Marks ─────────────────────────────────────────────────
function ReviewsPageSection() {
  const { projects, user } = useApp()
  const isStudent = user?.role === "USER"
  const myProjects = isStudent
    ? projects.filter(p => p.userId === parseInt(user!.id))
    : projects.filter(p => p.userId !== null)

  return (
    <ProjectListSection
      title="Remarks & Marks"
      icon={Award}
      color="text-rose-500"
      projects={myProjects}
      emptyMessage="No active projects found for reviews."
      renderItem={(p) => (
        <div key={p.id} className="rounded-2xl border border-border/60 bg-card p-6 w-full">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Award className="h-4 w-4 text-rose-500" /> {p.name}
          </h3>
          <ReviewSection projectId={p.id} />
        </div>
      )}
    />
  )
}


// ─── Helper: Section Shell ────────────────────────────────────────────────────
function SectionShell({ icon: Icon, title, color = "text-primary", children }: {
  icon: React.ElementType; title: string; color?: string; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 pb-4 border-b border-border/60">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-muted`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function EmptyPlaceholder({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border py-20">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

// ─── Section: Add Project ─────────────────────────────────────────────────────
function AddProjectSection({ isProposal }: { isProposal?: boolean }) {
  return (
    <SectionShell icon={isProposal ? Lightbulb : Plus} title={isProposal ? "Add Project Title" : "Add Project"} color="text-primary">
      <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-border/60 bg-card py-16 px-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          {isProposal ? <Lightbulb className="h-8 w-8 text-primary" /> : <FolderKanban className="h-8 w-8 text-primary" />}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">{isProposal ? "Create a Project Title" : "Create a New Project"}</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            {isProposal
              ? "Add a new project proposal for students to browse and select."
              : "Add a new project to track its timeline, team, and progress."}
          </p>
        </div>
        <AddProjectDialog isProposal={isProposal} />
      </div>
    </SectionShell>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function Dashboard() {
  const { projects, user } = useApp()
  const { activeSection } = useNav()

  const isStudent = user?.role === "USER"
  const studentProjects = projects.filter(p => isStudent && p.userId === parseInt(user!.id))
  const allAssigned = projects.filter(p => p.userId !== null)
  const allProposals = projects.filter(p => p.userId === null)

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection />
      case "all-projects":
        return (
          <ProjectListSection
            title="All Projects"
            icon={FolderKanban}
            projects={allAssigned}
            emptyMessage="No projects have been assigned yet."
          />
        )
      case "proposals":
        return (
          <ProjectListSection
            title={isStudent ? "Available Projects" : "Proposals"}
            icon={Lightbulb}
            projects={allProposals}
            isProposals={true}
            emptyMessage={isStudent ? "No projects available to claim right now." : "No proposals yet."}
          />
        )
      case "my-project":
        return (
          <ProjectListSection
            title="My Project"
            icon={BookUser}
            projects={studentProjects}
            emptyMessage="You haven't selected a project yet. Go to 'Available Projects' to pick one."
          />
        )
      case "timeline":
        return <TimelineScheduleSection />
      case "daily-logs":
        return <DailyLogsPageSection />
      case "srs":
        return <SrsPageSection />
      case "docs":
        return <DocsPageSection />
      case "reviews":
        return <ReviewsPageSection />
      case "add-project":
        return <AddProjectSection />
      case "add-proposal":
        return <AddProjectSection isProposal />
      default:
        return <OverviewSection />
    }
  }

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      {renderSection()}
    </div>
  )
}
