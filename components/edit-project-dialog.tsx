"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Loader2, Pencil, Plus, Trash2, Users } from "lucide-react"
import { useApp } from "@/lib/app-context"
import { Project } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Project name must be at least 2 characters.",
    }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
    }),
    fromDate: z.date({
        required_error: "Start date is required.",
    }),
    toDate: z.date({
        required_error: "End date is required.",
    }),
    assignedEmail: z.string().email({
        message: "Please enter a valid email address.",
    }),
    assignedName: z.string().optional(),
    assignedId: z.string().optional(),
})

export function EditProjectDialog({ project }: { project: Project }) {
    const { updateProject } = useApp()
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [teamMembers, setTeamMembers] = useState<{ name: string; employeeId: string }[]>(
        project.teamMembers?.map(m => ({ name: m.name, employeeId: m.employeeId })) || []
    )

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

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: project.name,
            description: project.description,
            fromDate: new Date(project.fromDate),
            toDate: new Date(project.toDate),
            assignedEmail: project.assignedEmail || "",
            assignedName: project.assignedName || "",
            assignedId: project.assignedId || "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            await updateProject(project.id.toString(), {
                ...values,
                fromDate: values.fromDate.toISOString(),
                toDate: values.toDate.toISOString(),
                teamMembers: teamMembers.filter(m => m.name.trim()),
            } as any)
            setOpen(false)
            form.reset()
        } catch (error) {
            console.error("Failed to update project", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit project
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Project</DialogTitle>
                    <DialogDescription>
                        Make changes to the project details correctly.
                        Click save when you're done.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Website Redesign" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="fromDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Start Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "pl-3 text-left font-normal",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PPP")
                                                                ) : (
                                                                    <span>Pick a date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) =>
                                                                date < new Date("1900-01-01")
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="toDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>End Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "pl-3 text-left font-normal",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PPP")
                                                                ) : (
                                                                    <span>Pick a date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) =>
                                                                date < new Date("1900-01-01")
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="assignedEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Manager Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="developer@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Project details..."
                                                    className="min-h-[120px] resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-2 p-3 bg-muted/30 rounded-lg border border-dashed">
                                    <div className="col-span-2">
                                        <Label className="text-[10px] uppercase text-muted-foreground">Primary Assignee (Optional)</Label>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="assignedName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input className="h-8 text-xs" placeholder="Name" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="assignedId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input className="h-8 text-xs" placeholder="ID" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-primary" />
                                    <Label className="text-sm font-semibold">Team Members</Label>
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
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                                    {teamMembers.map((member, index) => (
                                        <div key={index} className="flex gap-2 items-start">
                                            <Input
                                                placeholder="Name"
                                                value={member.name}
                                                onChange={(e) => updateTeamMember(index, "name", e.target.value)}
                                                className="h-9"
                                            />
                                            <Input
                                                placeholder="ID/Roll No"
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

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
