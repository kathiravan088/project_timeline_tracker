"use client"

import { Sidebar, MobileMenuButton } from "@/components/sidebar"
import { useNav } from "@/lib/nav-context"
import { useApp } from "@/lib/app-context"
import { FolderKanban, Bell } from "lucide-react"

const PAGE_TITLES: Record<string, string> = {
    overview: "Dashboard",
    "all-projects": "All Projects",
    proposals: "Proposals",
    "my-project": "My Project",
    timeline: "Timeline & Schedule",
    "daily-logs": "Daily Logs",
    srs: "SRS Documents",
    docs: "Project Docs",
    reviews: "Remarks & Marks",
    "add-project": "Add Project",
    "add-proposal": "Add Project Title",
}

function TopBar() {
    const { activeSection } = useNav()
    const { user } = useApp()
    const title = PAGE_TITLES[activeSection] ?? "TrackFlow"

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-card/80 backdrop-blur-md px-4 sm:px-6 shrink-0">
            <div className="flex items-center gap-3">
                <MobileMenuButton />
                <div className="hidden lg:block">
                    <h1 className="text-base font-semibold text-foreground tracking-tight">{title}</h1>
                </div>
                <div className="flex items-center gap-2 lg:hidden">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-md shadow-primary/30">
                        <FolderKanban className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-sm font-bold text-foreground">TrackFlow</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer">
                    <Bell className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 rounded-full bg-muted/50 border border-border/40 px-3 py-1.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {user?.name?.charAt(0).toUpperCase() ?? "U"}
                    </div>
                    <span className="hidden sm:block text-xs font-medium text-foreground">{user?.name}</span>
                    <span className="hidden sm:block text-[10px] text-muted-foreground border-l border-border/60 pl-2 uppercase tracking-wide">{user?.role}</span>
                </div>
            </div>
        </header>
    )
}

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <TopBar />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
