"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Project, User } from "./types"
import { useSession, signIn, signOut } from "next-auth/react"

interface AppContextType {
  user: User | null
  projects: Project[]
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  addProject: (project: Omit<Project, "id" | "createdAt">) => Promise<void>
  updateProjectStatus: (id: string, status: Project["status"]) => Promise<void>
  updateProject: (id: string, data: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [projects, setProjects] = useState<Project[]>([])

  const user = session?.user ? {
    id: (session.user as any).id || "unknown",
    email: session.user.email!,
    name: session.user.name!,
    role: (session.user as any).role
  } : null

  const isAuthenticated = status === "authenticated"
  const isLoading = status === "loading"

  const fetchProjects = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      }
    } catch (error) {
      console.error("Failed to fetch projects", error)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchProjects()
    const interval = setInterval(fetchProjects, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [fetchProjects])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })
      return !result?.error
    } catch (err) {
      console.error('Login failed', err)
      return false
    }
  }, [])

  const logout = useCallback(() => {
    signOut({ callbackUrl: "/" })
  }, [])

  const addProject = useCallback(async (project: Omit<Project, "id" | "createdAt">) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...project, userId: (session?.user as any)?.id }),
      })

      if (res.ok) {
        const newProject = await res.json()
        setProjects((prev) => [newProject, ...prev])
      }
    } catch (error) {
      console.error("Failed to add project", error)
    }
  }, [session])

  const updateProjectStatus = useCallback(async (id: string, status: Project["status"]) => {
    // Optimistic update
    setProjects((prev) =>
      prev.map((p) => (String(p.id) === String(id) ? { ...p, status } : p))
    )

    try {
      // Ideally we would have a PATCH endpoint here, assuming one exists or using the store for now if not fully implemented in backend yet for status specifically.
      // For now, let's assume we will implement the endpoint.
      await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
    } catch (error) {
      console.error("Failed to update status", error)
      fetchProjects() // Revert on error
    }
  }, [fetchProjects])

  const updateProject = useCallback(async (id: string, data: Partial<Project>) => {
    // Optimistic update
    setProjects((prev) =>
      prev.map((p) => (String(p.id) === String(id) ? { ...p, ...data } : p))
    )

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        throw new Error('Failed to update project')
      }

      const updatedProject = await res.json()
      // Update with actual data from server to ensure consistency
      setProjects((prev) =>
        prev.map((p) => (String(p.id) === String(id) ? updatedProject : p))
      )
    } catch (error) {
      console.error("Failed to update project", error)
      fetchProjects() // Revert on error
    }
  }, [fetchProjects])

  const deleteProject = useCallback(async (id: string) => {
    // Optimistic update
    setProjects((prev) => prev.filter((p) => String(p.id) !== String(id)))

    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    } catch (error) {
      console.error("Failed to delete project", error)
      fetchProjects()
    }
  }, [fetchProjects])

  return (
    <AppContext.Provider
      value={{
        user,
        projects,
        isAuthenticated,
        isLoading,
        login,
        logout,
        addProject,
        updateProjectStatus,
        updateProject,
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
