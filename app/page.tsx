"use client"

import { useApp } from "@/lib/app-context"
import { NavProvider } from "@/lib/nav-context"
import { LoginForm } from "@/components/login-form"
import { Dashboard } from "@/components/dashboard"
import { AppShell } from "@/components/app-shell"

function AppContent() {
  const { isAuthenticated } = useApp()

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return (
    <NavProvider>
      <AppShell>
        <Dashboard />
      </AppShell>
    </NavProvider>
  )
}

export default function Page() {
  return <AppContent />
}
