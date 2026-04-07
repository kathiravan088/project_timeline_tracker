"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type NavSection =
    | "overview"
    | "all-projects"
    | "proposals"
    | "my-project"
    | "timeline"
    | "daily-logs"
    | "srs"
    | "docs"
    | "reviews"
    | "add-project"
    | "add-proposal"

interface NavContextType {
    activeSection: NavSection
    setActiveSection: (section: NavSection) => void
    sidebarCollapsed: boolean
    setSidebarCollapsed: (collapsed: boolean) => void
    mobileSidebarOpen: boolean
    setMobileSidebarOpen: (open: boolean) => void
}

const NavContext = createContext<NavContextType | undefined>(undefined)

export function NavProvider({ children }: { children: ReactNode }) {
    const [activeSection, setActiveSection] = useState<NavSection>("overview")
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

    return (
        <NavContext.Provider
            value={{
                activeSection,
                setActiveSection,
                sidebarCollapsed,
                setSidebarCollapsed,
                mobileSidebarOpen,
                setMobileSidebarOpen,
            }}
        >
            {children}
        </NavContext.Provider>
    )
}

export function useNav() {
    const ctx = useContext(NavContext)
    if (!ctx) throw new Error("useNav must be used within NavProvider")
    return ctx
}
