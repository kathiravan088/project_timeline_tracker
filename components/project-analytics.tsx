"use client"

import { useApp } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts"

export function ProjectAnalytics() {
    const { projects, user } = useApp()

    // Show all projects to all users for global status overview
    const userProjects = projects

    const total = userProjects.length
    const statusData = [
        { name: "Pending", value: userProjects.filter((p) => p.status === "pending").length },
        { name: "Approved", value: userProjects.filter((p) => p.status === "approved").length },
        { name: "Rejected", value: userProjects.filter((p) => p.status === "rejected").length },
        { name: "Not Started", value: userProjects.filter((p) => p.status === "not-started").length },
        { name: "In Progress", value: userProjects.filter((p) => p.status === "in-progress").length },
        { name: "Completed", value: userProjects.filter((p) => p.status === "completed").length },
    ].filter(d => d.value > 0)

    const COLORS = ["#f59e0b", "#3b82f6", "#ef4444", "#94a3b8", "#6366f1", "#22c55e"]

    const completionRate = total > 0
        ? Math.round((userProjects.filter((p) => p.status === "completed").length / total) * 100)
        : 0

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Completed %</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-center">
                    <div className="flex flex-col items-center gap-2 py-4">
                        <div className="relative flex h-32 w-32 items-center justify-center">
                            <svg className="h-full w-full" viewBox="0 0 100 100">
                                <circle
                                    className="text-muted stroke-current"
                                    strokeWidth="8"
                                    fill="transparent"
                                    r="40"
                                    cx="50"
                                    cy="50"
                                />
                                <circle
                                    className="text-primary stroke-current transition-all duration-1000 ease-in-out"
                                    strokeWidth="8"
                                    strokeDasharray={251.2}
                                    strokeDashoffset={251.2 - (251.2 * completionRate) / 100}
                                    strokeLinecap="round"
                                    fill="transparent"
                                    r="40"
                                    cx="50"
                                    cy="50"
                                    transform="rotate(-90 50 50)"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-3xl font-bold">{completionRate}%</span>
                                <span className="text-[10px] uppercase text-muted-foreground">Completed</span>
                            </div>
                        </div>
                        <p className="text-center text-sm text-muted-foreground">
                            {completionRate === 100 ? "All projects delivered! 🎉" : "Keep moving forward."}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
