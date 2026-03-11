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
import { format } from "date-fns"
import { Calendar as CalendarIcon, Loader2, Plus, Trash2, Users } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

export function AddProjectDialog({ isProposal = false }: { isProposal?: boolean }) {
  const { addProject, user } = useApp()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<ProjectStatus>("not-started")
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined)
  const [toDate, setToDate] = useState<Date | undefined>(undefined)
  const [assignedEmail, setAssignedEmail] = useState("")
  const [assignedName, setAssignedName] = useState("")
  const [assignedId, setAssignedId] = useState("")
  const [teamMembers, setTeamMembers] = useState<{ name: string; employeeId: string }[]>([])
  const [technologies, setTechnologies] = useState("")
  const [maxStudents, setMaxStudents] = useState("1")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setName("")
    setDescription("")
    setStatus("not-started")
    setFromDate(undefined)
    setToDate(undefined)
    setAssignedEmail("")
    setAssignedName("")
    setAssignedId("")
    setTeamMembers([])
    setTechnologies("")
    setMaxStudents("1")
    setErrors({})
  }

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { name: "", employeeId: "" }])
  }

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index))
  }

  const updateTeamMember = (index: number, field: "name" | "employeeId", value: string) => {
    const updated = [...teamMembers]
    updated[index][field] = value
    setTeamMembers(updated)
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = "Project name is required"
    if (!description.trim()) newErrors.description = "Description is required"

    // Email only required for students or if specifically assigned
    if (isStudent && !assignedEmail.trim()) {
      newErrors.assignedEmail = "Contact email is required"
    }

    if (fromDate && toDate && fromDate > toDate) {
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
      fromDate: fromDate?.toISOString() || "",
      toDate: toDate?.toISOString() || "",
      assignedEmail: assignedEmail.trim() || (isStudent ? user?.email : (isProposal ? user?.email : null)) || null,
      assignedName: assignedName.trim() || (isProposal ? user?.name : null) || null,
      assignedId: assignedId.trim() || (isProposal ? user?.id : null) || null,
      guideName: isProposal ? user?.name : null,
      isProposal: isProposal,
      technologies: technologies.trim() || null,
      maxStudents: parseInt(maxStudents) || 1,
      teamMembers: teamMembers.filter(m => m.name.trim()), // Only include members with a name
    } as any)

    resetForm()
    setOpen(false)
  }

  const isStudent = user?.role !== "ADMIN" && user?.role !== "FACULTY"

  return (
    <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) resetForm() }}>
      <DialogTrigger asChild>
        <Button className={isProposal ? "gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground" : "gap-2"}>
          <Plus className="h-4 w-4" />
          {isProposal ? "Add Project Title" : isStudent ? "Submit Project Title" : "Add Project"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isProposal ? "Create Project Proposal" : isStudent ? "Submit Project Proposal" : "Create New Project"}
          </DialogTitle>
          <DialogDescription>
            {isProposal
              ? "Create a new project title for students to select."
              : isStudent
                ? "Submit your project title and problem statement for review."
                : "Add a new project to track its timeline and progress."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              {/* Project Name */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="project-name" className="text-foreground">
                  Project Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="project-name"
                  placeholder="Enter project title"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              {/* Technologies Used & Max Students (Proposal mode) */}
              {isProposal && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="technologies" className="text-foreground">
                      Technologies
                    </Label>
                    <Input
                      id="technologies"
                      placeholder="e.g. React, Node.js"
                      value={technologies}
                      onChange={(e) => setTechnologies(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="max-students" className="text-foreground">
                      Max Students
                    </Label>
                    <Input
                      id="max-students"
                      type="number"
                      min="1"
                      max="10"
                      value={maxStudents}
                      onChange={(e) => setMaxStudents(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Status - Hidden/Disabled for Students or Proposal mode */}
              {!isStudent && !isProposal && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-foreground">Status</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as ProjectStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="not-started">Not Started</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Date Range - Optional/Hidden for Students if only submitting title */}
              {!isStudent && !isProposal && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-foreground">From Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !fromDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {fromDate ? format(fromDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={fromDate}
                          onSelect={setFromDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.fromDate && <p className="text-xs text-destructive">{errors.fromDate}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-foreground">To Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !toDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {toDate ? format(toDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={toDate}
                          onSelect={setToDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.toDate && <p className="text-xs text-destructive">{errors.toDate}</p>}
                  </div>
                </div>
              )}

              {/* Assigned Email - Optional in Proposal mode */}
              {!isProposal && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="assigned-email" className="text-foreground">
                    Contact Email {!isStudent && "(Optional for Proposal)"} {isStudent && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id="assigned-email"
                    type="email"
                    placeholder="user@example.com"
                    value={isStudent ? user?.email || "" : assignedEmail}
                    onChange={(e) => setAssignedEmail(e.target.value)}
                    disabled={isStudent}
                  />
                  {errors.assignedEmail && <p className="text-xs text-destructive">{errors.assignedEmail}</p>}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Description / Problem Statement */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="project-description" className="text-foreground">
                  Problem Statement <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="project-description"
                  placeholder="Describe the problem your project aims to solve"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px]"
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
              </div>

              {/* Register Number / Student Info - Hidden in Proposal Mode */}
              {!isProposal && (
                <div className="grid grid-cols-2 gap-2 p-3 bg-muted/30 rounded-lg border border-dashed">
                  <div className="col-span-2">
                    <Label className="text-[10px] uppercase text-muted-foreground">Student Information</Label>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Input
                      className="h-8 text-xs"
                      placeholder="Student Name"
                      value={assignedName}
                      onChange={(e) => setAssignedName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Input
                      className="h-8 text-xs"
                      placeholder="Register Number"
                      value={assignedId}
                      onChange={(e) => setAssignedId(e.target.value)}
                      required={isStudent}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">Team Members (Optional)</Label>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addTeamMember} className="h-8">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Member
              </Button>
            </div>

            {teamMembers.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                No team members added yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                {teamMembers.map((member, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <Input
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) => updateTeamMember(index, "name", e.target.value)}
                      className="h-9"
                    />
                    <Input
                      placeholder="Register No"
                      value={member.employeeId}
                      onChange={(e) => updateTeamMember(index, "employeeId", e.target.value)}
                      className="h-9 w-32"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTeamMember(index)}
                      className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => { resetForm(); setOpen(false) }}>
              Cancel
            </Button>
            <Button type="submit">{isStudent ? "Submit Proposal" : "Create Project"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
