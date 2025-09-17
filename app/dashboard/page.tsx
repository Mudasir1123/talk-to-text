"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  Upload,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Users,
  Zap,
  Plus,
  ArrowRight,
  Activity,
} from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

interface Meeting {
  id: number
  title: string
  filename: string
  upload_date: string
  status: string
  has_transcription: boolean
  has_notes: boolean
}

interface DashboardStats {
  total_meetings: number
  completed_meetings: number
  processing_meetings: number
  total_duration: number
  this_week_meetings: number
}

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token) {
      router.push("/login")
      return
    }

    if (userData) {
      setUser(JSON.parse(userData))
    }

    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch meetings
      const meetingsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/meetings?limit=10000000`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (meetingsResponse.ok) {
        const meetingsData = await meetingsResponse.json()
        setMeetings(meetingsData.meetings)

        // Calculate stats from meetings data
        const totalMeetings = meetingsData.meetings.length
        const completedMeetings = meetingsData.meetings.filter((m: Meeting) => m.status === "completed").length
        const processingMeetings = meetingsData.meetings.filter((m: Meeting) => m.status === "processing").length

        // Calculate this week's meetings
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const thisWeekMeetings = meetingsData.meetings.filter((m: Meeting) => {
          const uploadDate = new Date(m.upload_date)
          return uploadDate >= oneWeekAgo
        }).length

        setStats({
          total_meetings: totalMeetings,
          completed_meetings: completedMeetings,
          processing_meetings: processingMeetings,
          total_duration: 0, // Would need to calculate from actual data
          this_week_meetings: thisWeekMeetings,
        })
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-accent" />
      case "processing":
        return <Clock className="w-4 h-4 text-primary animate-pulse" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-destructive" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
            Completed
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
            Processing
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="secondary" className="bg-destructive/20 text-destructive border-destructive/30">
            Failed
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-muted/20 text-muted-foreground border-muted/30">
            Uploaded
          </Badge>
        )
    }
  }

  // Calculate weekly data from real meetings
  const weeklyData = (() => {
    if (!meetings || meetings.length === 0) {
      return [
        { day: "Mon", meetings: 0 },
        { day: "Tue", meetings: 0 },
        { day: "Wed", meetings: 0 },
        { day: "Thu", meetings: 0 },
        { day: "Fri", meetings: 0 },
        { day: "Sat", meetings: 0 },
        { day: "Sun", meetings: 0 },
      ]
    }

    const today = new Date()
    const daysAhead = today.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - (daysAhead === 0 ? 6 : daysAhead - 1)) // Monday as start
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const dailyCounts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 }

    meetings.forEach((meeting: Meeting) => {
      const uploadDate = new Date(meeting.upload_date)
      if (uploadDate >= startOfWeek && uploadDate <= endOfWeek) {
        const dayIndex = uploadDate.getDay() // 0=Sun, 1=Mon, etc.
        const dayKey = daysOfWeek[dayIndex === 0 ? 6 : dayIndex - 1] // Adjust to Mon=0, Sun=6
        dailyCounts[dayKey] += 1
      }
    })

    return daysOfWeek.map(day => ({ day, meetings: dailyCounts[day] }))
  })()

  const statusData = [
    { name: "Completed", value: stats?.completed_meetings || 0, color: "#10b981" },
    { name: "Processing", value: stats?.processing_meetings || 0, color: "#6366f1" },
    {
      name: "Failed",
      value: (stats?.total_meetings || 0) - (stats?.completed_meetings || 0) - (stats?.processing_meetings || 0),
      color: "#ef4444",
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Welcome back, {user?.full_name || user?.email}
              </h1>
              <p className="text-xl text-muted-foreground">Here's an overview of your meeting analysis activity</p>
            </div>
            <Link href="/upload">
              <Button className="glass-button bg-primary/20 border-primary/30 hover:bg-primary/30 glow mt-4 md:mt-0">
                <Plus className="w-4 h-4 mr-2" />
                Upload Meeting
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="glass-card smooth-transition scale-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Meetings</p>
                    <p className="text-3xl font-bold">{stats?.total_meetings || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center glow">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card smooth-transition scale-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Completed</p>
                    <p className="text-3xl font-bold">{stats?.completed_meetings || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-accent to-primary rounded-lg flex items-center justify-center glow-green">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card smooth-transition scale-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">This Week</p>
                    <p className="text-3xl font-bold">{stats?.this_week_meetings || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center glow">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card smooth-transition scale-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Processing</p>
                    <p className="text-3xl font-bold">{stats?.processing_meetings || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-accent to-primary rounded-lg flex items-center justify-center glow-green">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Weekly Activity Chart */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Weekly Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" />
                    <YAxis stroke="rgba(255,255,255,0.6)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        backdropFilter: "blur(20px)",
                      }}
                    />
                    <Bar dataKey="meetings" fill="url(#gradient)" radius={[4, 4, 0, 0]} />
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Processing Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        backdropFilter: "blur(20px)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center space-x-4 mt-4">
                  {statusData.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                      <span className="text-sm text-muted-foreground">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Meetings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Recent Meetings</span>
                </div>
                <Link href="/history">
                  <Button variant="outline" size="sm" className="glass-button bg-transparent">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {meetings.length === 0 ? (
                <div className="text-center py-12">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No meetings yet</h3>
                  <p className="text-muted-foreground mb-4">Upload your first meeting recording to get started</p>
                  <Link href="/upload">
                    <Button className="glass-button bg-primary/20 border-primary/30 hover:bg-primary/30 glow">
                      <Plus className="w-4 h-4 mr-2" />
                      Upload Meeting
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {meetings.slice(0, 5).map((meeting) => (
                    <div
                      key={meeting.id}
                      className="flex items-center justify-between p-4 glass rounded-lg smooth-transition hover:bg-white/10"
                    >
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(meeting.status)}
                        <div>
                          <h4 className="font-medium">{meeting.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(meeting.upload_date).toLocaleDateString()} • {meeting.filename}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(meeting.status)}
                        {meeting.has_notes && meeting.status === "completed" ? (
                          <Link href={`/meeting-notes/${meeting.id}`}>
                            <Button size="sm" className="glass-button bg-accent/20 border-accent/30 hover:bg-accent/30">
                              View Notes
                            </Button>
                          </Link>
                        ) : meeting.status === "processing" ? (
                          <Link href={`/processing/${meeting.id}`}>
                            <Button
                              size="sm"
                              className="glass-button bg-primary/20 border-primary/30 hover:bg-primary/30"
                            >
                              View Status
                            </Button>
                          </Link>
                        ) : (
                          <Button size="sm" variant="outline" className="glass-button bg-transparent" disabled>
                            Pending
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="glass-card smooth-transition scale-hover">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-4 glow">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Upload New Meeting</h3>
                <p className="text-muted-foreground mb-4">
                  Upload audio or video files from your meetings for AI analysis
                </p>
                <Link href="/upload">
                  <Button className="glass-button bg-primary/20 border-primary/30 hover:bg-primary/30">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="glass-card smooth-transition scale-hover">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-accent to-primary rounded-lg flex items-center justify-center mx-auto mb-4 glow-green">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">View All Meetings</h3>
                <p className="text-muted-foreground mb-4">Browse your complete meeting history and notes</p>
                <Link href="/history">
                  <Button className="glass-button bg-accent/20 border-accent/30 hover:bg-accent/30">
                    Browse History
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="glass-card smooth-transition scale-hover">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-4 glow">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Learn More</h3>
                <p className="text-muted-foreground mb-4">Discover advanced features and best practices</p>
                <Link href="/about">
                  <Button variant="outline" className="glass-button bg-transparent">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}