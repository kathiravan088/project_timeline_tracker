"use client"

import { AppProvider, useApp } from "@/lib/app-context"
import { LoginForm } from "@/components/login-form"
import { Dashboard } from "@/components/dashboard"

function AppContent() {
  const { isAuthenticated } = useApp()

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return <Dashboard />
}

export default function Page() {
  return <AppContent />
}
