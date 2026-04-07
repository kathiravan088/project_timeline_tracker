"use client"

import { useApp } from "@/lib/app-context"
import { useNav, type NavSection } from "@/lib/nav-context"
import {
    LayoutDashboard,
    FolderKanban,
    Lightbulb,
    BookUser,
    CalendarRange,
    MessageSquare,
    FileText,
    FolderOpen,
    Award,
    Plus,
    FilePlus,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
    id: NavSection
    label: string
    icon: React.ElementType
    roles?: string[]
    color?: string
}

interface NavGroup {
    label: string
    items: NavItem[]
}

function getNavGroups(role: string | undefined): NavGroup[] {
    const isAdmin = role === "ADMIN" || role === "FACULTY"
    const isStudent = role === "USER"

    const overviewGroup: NavGroup = {
        label: "Overview",
        items: [
            { id: "overview", label: "Dashboard", icon: LayoutDashboard },
        ],
    }

    const projectGroup: NavGroup = {
        label: "Projects",
        items: [
            ...(isAdmin ? [{ id: "all-projects" as NavSection, label: "All Projects", icon: FolderKanban }] : []),
            ...(isStudent ? [{ id: "my-project" as NavSection, label: "My Project", icon: BookUser }] : []),
            { id: "proposals", label: isStudent ? "Available Projects" : "Proposals", icon: Lightbulb },
        ],
    }

    const workGroup: NavGroup = {
        label: "Work",
        items: [
            { id: "timeline", label: "Timeline & Schedule", icon: CalendarRange, color: "text-violet-500" },
            { id: "daily-logs", label: "Daily Logs", icon: MessageSquare, color: "text-sky-500" },
        ],
    }

    const docsGroup: NavGroup = {
        label: "Documents",
        items: [
            { id: "srs", label: "SRS Documents", icon: FileText, color: "text-emerald-500" },
            { id: "docs", label: "Project Docs", icon: FolderOpen, color: "text-amber-500" },
        ],
    }

    const reviewsGroup: NavGroup = {
        label: "Reviews",
        items: [
            { id: "reviews", label: "Remarks & Marks", icon: Award, color: "text-rose-500" },
        ],
    }

    const manageGroup: NavGroup = {
        label: "Manage",
        items: [
            ...(isAdmin ? [
                { id: "add-project" as NavSection, label: "Add Project", icon: Plus, color: "text-primary" },
                { id: "add-proposal" as NavSection, label: "Add Project Title", icon: FilePlus, color: "text-primary" },
            ] : []),
        ],
    }

    const groups = [overviewGroup, projectGroup, workGroup, docsGroup, reviewsGroup]
    if (isAdmin && manageGroup.items.length > 0) groups.push(manageGroup)
    return groups
}

export function Sidebar() {
    const { user, logout } = useApp()
    const { activeSection, setActiveSection, sidebarCollapsed, setSidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useNav()

    const navGroups = getNavGroups(user?.role)

    const handleNavClick = (id: NavSection) => {
        setActiveSection(id)
        setMobileSidebarOpen(false)
    }

    const sidebarContent = (
        <div className="flex h-full flex-col">
            {/* Logo + Collapse Toggle */}
            <div className={cn(
                "flex h-16 items-center border-b border-sidebar-border px-4 shrink-0",
                sidebarCollapsed ? "justify-center" : "justify-between"
            )}>
                {!sidebarCollapsed && (
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30 shrink-0">
                            <FolderKanban className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-bold tracking-tight text-foreground">TrackFlow</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Project Tracker</span>
                        </div>
                    </div>
                )}
                {sidebarCollapsed && (
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
                        <FolderKanban className="h-5 w-5 text-primary-foreground" />
                    </div>
                )}
                <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className={cn(
                        "hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-all",
                        sidebarCollapsed && "absolute right-0 translate-x-1/2 shadow-md"
                    )}
                >
                    {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
                </button>
            </div>

            {/* Nav Groups */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-hide">
                {navGroups.map((group) => (
                    <div key={group.label}>
                        {!sidebarCollapsed && (
                            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 select-none">
                                {group.label}
                            </p>
                        )}
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const isActive = activeSection === item.id
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleNavClick(item.id)}
                                        title={sidebarCollapsed ? item.label : undefined}
                                        className={cn(
                                            "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                            sidebarCollapsed && "justify-center px-2"
                                        )}
                                    >
                                        {isActive && (
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-primary/80 opacity-100" />
                                        )}
                                        <item.icon className={cn(
                                            "relative h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                                            isActive ? "text-primary-foreground" : (item.color || "text-muted-foreground")
                                        )} />
                                        {!sidebarCollapsed && (
                                            <span className="relative truncate">{item.label}</span>
                                        )}
                                        {isActive && !sidebarCollapsed && (
                                            <div className="relative ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/70" />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* User + Logout */}
            <div className={cn(
                "shrink-0 border-t border-sidebar-border p-3",
                sidebarCollapsed ? "flex flex-col items-center gap-2" : ""
            )}>
                {!sidebarCollapsed ? (
                    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-muted/50">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-md">
                            {user?.name?.charAt(0).toUpperCase() ?? "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{user?.name ?? "User"}</p>
                            <p className="truncate text-[10px] text-muted-foreground uppercase tracking-wide">{user?.role}</p>
                        </div>
                        <button
                            onClick={logout}
                            title="Logout"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-md" title={user?.name}>
                            {user?.name?.charAt(0).toUpperCase() ?? "U"}
                        </div>
                        <button
                            onClick={logout}
                            title="Logout"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                        </button>
                    </>
                )}
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "relative hidden lg:flex flex-col h-screen bg-card border-r border-sidebar-border transition-all duration-300 ease-in-out shrink-0",
                    sidebarCollapsed ? "w-[64px]" : "w-[240px]"
                )}
            >
                {sidebarContent}
            </aside>

            {/* Mobile: Hamburger button is in AppShell topbar */}

            {/* Mobile Overlay Drawer */}
            {mobileSidebarOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                        onClick={() => setMobileSidebarOpen(false)}
                    />
                    <aside className="fixed left-0 top-0 z-50 flex h-full w-[260px] flex-col bg-card border-r border-sidebar-border lg:hidden shadow-2xl animate-in slide-in-from-left duration-300">
                        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
                                    <FolderKanban className="h-5 w-5 text-primary-foreground" />
                                </div>
                                <span className="text-sm font-bold tracking-tight text-foreground">TrackFlow</span>
                            </div>
                            <button
                                onClick={() => setMobileSidebarOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-hide">
                            {navGroups.map((group) => (
                                <div key={group.label}>
                                    <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 select-none">
                                        {group.label}
                                    </p>
                                    <div className="space-y-0.5">
                                        {group.items.map((item) => {
                                            const isActive = activeSection === item.id
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => handleNavClick(item.id)}
                                                    className={cn(
                                                        "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                                        isActive
                                                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                    )}
                                                >
                                                    {isActive && (
                                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-primary/80" />
                                                    )}
                                                    <item.icon className={cn(
                                                        "relative h-4 w-4 shrink-0",
                                                        isActive ? "text-primary-foreground" : (item.color || "text-muted-foreground")
                                                    )} />
                                                    <span className="relative">{item.label}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="shrink-0 border-t border-sidebar-border p-3">
                            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-muted/50">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                    {user?.name?.charAt(0).toUpperCase() ?? "U"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="truncate text-sm font-semibold text-foreground">{user?.name}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{user?.role}</p>
                                </div>
                                <button onClick={logout} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                                    <LogOut className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </aside>
                </>
            )}
        </>
    )
}

export function MobileMenuButton() {
    const { setMobileSidebarOpen } = useNav()
    return (
        <button
            onClick={() => setMobileSidebarOpen(true)}
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground hover:bg-muted transition-colors"
        >
            <Menu className="h-4 w-4" />
        </button>
    )
}
