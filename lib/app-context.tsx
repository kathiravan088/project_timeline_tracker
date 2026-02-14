"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Project, User } from "./types"

interface AppContextType {
  user: User | null
  projects: Project[]
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  addProject: (project: Omit<Project, "id" | "createdAt">) => void
  updateProjectStatus: (id: string, status: Project["status"]) => void
  deleteProject: (id: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const DEMO_PROJECTS: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Redesign the company website with a modern, responsive layout and improved user experience.",
    status: "in-progress",
    fromDate: "2026-01-15",
    toDate: "2026-03-30",
    assignedEmail: "demo@trackflow.app",
    createdAt: "2026-01-10T10:00:00Z",
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "Build a cross-platform mobile application for customer engagement and notifications.",
    status: "not-started",
    fromDate: "2026-04-01",
    toDate: "2026-08-15",
    assignedEmail: "dev@trackflow.app",
    createdAt: "2026-01-12T14:30:00Z",
  },
  {
    id: "3",
    name: "API Integration",
    description: "Integrate third-party APIs for payment processing, analytics, and email services.",
    status: "completed",
    fromDate: "2025-11-01",
    toDate: "2026-01-31",
    assignedEmail: "demo@trackflow.app",
    createdAt: "2025-10-28T09:15:00Z",
  },
]

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>(DEMO_PROJECTS)

  const isAuthenticated = user !== null

  const login = useCallback(async (email: string, _password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: _password }),
      })

      if (!res.ok) return false

      const data = await res.json()
      setUser({ email: data.email, name: data.name })
      return true
    } catch (err) {
      console.error('Login failed', err)
      return false
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const addProject = useCallback((project: Omit<Project, "id" | "createdAt">) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setProjects((prev) => [newProject, ...prev])
  }, [])

  const updateProjectStatus = useCallback((id: string, status: Project["status"]) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    )
  }, [])

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return (
    <AppContext.Provider
      value={{
        user,
        projects,
        isAuthenticated,
        login,
        logout,
        addProject,
        updateProjectStatus,
        deleteProject,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
