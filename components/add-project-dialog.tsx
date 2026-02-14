"use client"

import React from "react"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import type { ProjectStatus } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"

export function AddProjectDialog() {
  const { addProject, user } = useApp()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<ProjectStatus>("not-started")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [assignedEmail, setAssignedEmail] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setName("")
    setDescription("")
    setStatus("not-started")
    setFromDate("")
    setToDate("")
    setAssignedEmail("")
    setErrors({})
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = "Project name is required"
    if (!description.trim()) newErrors.description = "Description is required"
    if (!fromDate) newErrors.fromDate = "Start date is required"
    if (!toDate) newErrors.toDate = "End date is required"
    if (!assignedEmail.trim()) newErrors.assignedEmail = "Assigned email is required"

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      newErrors.toDate = "End date must be after start date"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    addProject({
      name: name.trim(),
      description: description.trim(),
      status,
      fromDate,
      toDate,
      assignedEmail: assignedEmail.trim() || user?.email || "",
    })

    resetForm()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) resetForm() }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to track its timeline and progress.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Project Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-name" className="text-foreground">
              Project Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="project-name"
              placeholder="Enter project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-description" className="text-foreground">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="project-description"
              placeholder="Describe the project goals and scope"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-foreground">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as ProjectStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="from-date" className="text-foreground">
                From Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              {errors.fromDate && <p className="text-xs text-destructive">{errors.fromDate}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="to-date" className="text-foreground">
                To Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
              {errors.toDate && <p className="text-xs text-destructive">{errors.toDate}</p>}
            </div>
          </div>

          {/* Assigned Email */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="assigned-email" className="text-foreground">
              Assigned / Created User Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="assigned-email"
              type="email"
              placeholder="user@example.com"
              value={assignedEmail}
              onChange={(e) => setAssignedEmail(e.target.value)}
            />
            {errors.assignedEmail && <p className="text-xs text-destructive">{errors.assignedEmail}</p>}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => { resetForm(); setOpen(false) }}>
              Cancel
            </Button>
            <Button type="submit">Add Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
