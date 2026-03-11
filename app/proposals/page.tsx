"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/lib/app-context"
import { ProjectCard } from "@/components/project-card"
import { DashboardHeader } from "@/components/dashboard-header"
import { LoginForm } from "@/components/login-form"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, FolderOpen, Search, PanelsTopLeft } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function ProposalsPage() {
    const { projects, user, isAuthenticated } = useApp()
    const [search, setSearch] = useState("")
    const [currentIndex, setCurrentIndex] = useState(0)

    if (!isAuthenticated) {
        return <LoginForm />
    }

    const proposals = projects.filter(p => !p.userId &&
        (p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase()))
    )

    const nextProject = () => {
        if (currentIndex < proposals.length - 1) {
            setCurrentIndex(currentIndex + 1)
        }
    }

    const prevProject = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <DashboardHeader />

            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-10">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-extrabold tracking-tight">Available Project Proposals</h1>
                        <p className="text-muted-foreground max-w-2xl">
                            Browse through project titles created by faculty. Claim a project to start working on it and track your progress.
                        </p>
                    </div>

                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search proposals..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentIndex(0); }}
                            className="pl-10 h-11 bg-card border-border/60"
                        />
                    </div>

                    {proposals.length > 0 ? (
                        <div className="relative flex flex-col items-center gap-8">
                            <div className="flex w-full items-center justify-between gap-6">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={prevProject}
                                    disabled={currentIndex === 0}
                                    className="h-14 w-14 shrink-0 rounded-full border-2 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-20"
                                >
                                    <ChevronLeft className="h-8 w-8" />
                                </Button>

                                <div className="flex-1 w-full max-w-4xl transition-all duration-500 ease-in-out transform">
                                    <div key={proposals[currentIndex].id} className="animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-700">
                                        <ProjectCard project={proposals[currentIndex]} isProposal={true} />

                                        {user?.role === "USER" && (
                                            <div className="mt-10 flex justify-center">
                                                <Button
                                                    variant="default"
                                                    size="lg"
                                                    className="w-full max-w-md h-14 text-xl font-bold shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-2xl border-2 border-primary/20"
                                                    onClick={async () => {
                                                        try {
                                                            const res = await fetch(`/api/projects/${proposals[currentIndex].id}/select`, {
                                                                method: 'POST'
                                                            })
                                                            if (res.ok) {
                                                                window.location.href = '/'
                                                            } else {
                                                                const data = await res.json()
                                                                alert(data.error || 'Failed to select project')
                                                            }
                                                        } catch (e) {
                                                            alert('Network error')
                                                        }
                                                    }}
                                                >
                                                    Claim this Project
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={nextProject}
                                    disabled={currentIndex === proposals.length - 1}
                                    className="h-14 w-14 shrink-0 rounded-full border-2 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-20"
                                >
                                    <ChevronRight className="h-8 w-8" />
                                </Button>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                                    Proposal {currentIndex + 1} of {proposals.length}
                                </span>
                                <div className="flex gap-2">
                                    {proposals.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-8 bg-primary" : "w-2 bg-border hover:bg-muted-foreground/30 cursor-pointer"
                                                }`}
                                            onClick={() => setCurrentIndex(idx)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border-2 border-dashed border-border py-24 bg-card/30">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted shadow-inner">
                                <FolderOpen className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-xl font-bold text-foreground">No proposals found</p>
                                <p className="text-muted-foreground max-w-xs mx-auto">
                                    Try adjusting your search or check back later for new project titles from faculty.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
