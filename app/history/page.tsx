"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Loader2,
  Upload,
  Plus,
  Trash2,
  FileDown,
  X,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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

export default function HistoryPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date_desc")
  const router = useRouter()
  
  // Popup states
  const [showDeletePopup, setShowDeletePopup] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [showDownloadPopup, setShowDownloadPopup] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadType, setDownloadType] = useState<'pdf' | 'word' | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    fetchMeetings()
  }, [router])

  useEffect(() => {
    filterAndSortMeetings()
  }, [meetings, searchTerm, statusFilter, sortBy])

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/meetings?limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMeetings(data.meetings)
      } else {
        console.error("Failed to fetch meetings:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching meetings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteMeeting = async (meetingId: number) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/meetings/${meetingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setMeetings((prev) => prev.filter((meeting) => meeting.id !== meetingId))
        setFilteredMeetings((prev) => prev.filter((meeting) => meeting.id !== meetingId))
        setShowDeletePopup(false)
        setShowSuccessPopup(true)
      } else {
        const errorData = await response.json()
        console.error("Failed to delete meeting:", response.status, errorData)
        alert(`Failed to delete meeting: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Error deleting meeting:", error)
    }
  }

  const downloadMeeting = async (meetingId: number, format: 'pdf' | 'word') => {
    try {
      setIsDownloading(true)
      setDownloadType(format)
      
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/export/${meetingId}/${format}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `meeting_notes_${meetingId}.${format === 'pdf' ? 'pdf' : 'docx'}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        setShowDownloadPopup(false)
        setShowSuccessPopup(true)
      } else {
        const errorData = await response.json()
        console.error("Failed to download meeting:", response.status, errorData)
        alert(`Failed to download meeting: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Error downloading meeting:", error)
      alert("Error downloading meeting. Please try again.")
    } finally {
      setIsDownloading(false)
      setDownloadType(null)
    }
  }

  const handleDeleteClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setShowDeletePopup(true)
  }

  const handleDownloadClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setShowDownloadPopup(true)
  }

  const filterAndSortMeetings = () => {
    let filtered = [...meetings]

    if (searchTerm) {
      filtered = filtered.filter(
        (meeting) =>
          meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          meeting.filename.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((meeting) => meeting.status === statusFilter)
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date_desc":
          return new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime()
        case "date_asc":
          return new Date(a.upload_date).getTime() - new Date(b.upload_date).getTime()
        case "title_asc":
          return a.title.localeCompare(b.title)
        case "title_desc":
          return b.title.localeCompare(a.title)
        default:
          return 0
      }
    })

    setFilteredMeetings(filtered)
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your meeting history...</p>
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 lg:mb-12">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Meeting History
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground">Browse and manage all your processed meeting recordings</p>
            </div>
            <Link href="/upload">
              <Button className="glass-button bg-primary/20 border-primary/30 hover:bg-primary/30 glow w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Upload Meeting
              </Button>
            </Link>
          </div>

          <Card className="glass-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <Filter className="w-5 h-5" />
                <span>Filter & Search</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative sm:col-span-2 lg:col-span-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search meetings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="glass pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="glass">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="uploaded">Uploaded</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="glass">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="date_desc">Newest First</SelectItem>
                    <SelectItem value="date_asc">Oldest First</SelectItem>
                    <SelectItem value="title_asc">Title A-Z</SelectItem>
                    <SelectItem value="title_desc">Title Z-A</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center justify-center lg:justify-start space-x-2 text-sm text-muted-foreground">
                  <span>{filteredMeetings.length} meetings found</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {filteredMeetings.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 sm:p-12 text-center">
                {meetings.length === 0 ? (
                  <>
                    <Upload className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl sm:text-2xl font-semibold mb-2">No meetings yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Upload your first meeting recording to get started with AI-powered analysis
                    </p>
                    <Link href="/upload">
                      <Button className="glass-button bg-primary/20 border-primary/30 hover:bg-primary/30 glow w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Upload Your First Meeting
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Search className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl sm:text-2xl font-semibold mb-2">No meetings found</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Try adjusting your search terms or filters to find what you're looking for
                    </p>
                    <Button
                      onClick={() => {
                        setSearchTerm("")
                        setStatusFilter("all")
                      }}
                      variant="outline"
                      className="glass-button bg-transparent w-full sm:w-auto"
                    >
                      Clear Filters
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredMeetings.map((meeting) => (
                <Card key={meeting.id} className="glass-card smooth-transition hover:bg-white/5">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                      <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 mt-1">{getStatusIcon(meeting.status)}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold mb-1 truncate pr-2">{meeting.title}</h3>
                          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{formatDate(meeting.upload_date)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FileText className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{meeting.filename}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {getStatusBadge(meeting.status)}
                            {meeting.has_transcription && (
                              <Badge variant="outline" className="border-muted/30 text-muted-foreground text-xs">
                                Transcribed
                              </Badge>
                            )}
                            {meeting.has_notes && (
                              <Badge variant="outline" className="border-accent/30 text-accent text-xs">
                                Notes Available
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:flex-nowrap">
                        {meeting.status === "processing" && (
                          <Link href={`/processing/${meeting.id}`} className="flex-1 sm:flex-none">
                            <Button
                              size="sm"
                              className="glass-button bg-primary/20 border-primary/30 hover:bg-primary/30 w-full sm:w-auto"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              <span className="hidden sm:inline">View Status</span>
                              <span className="sm:hidden">Status</span>
                            </Button>
                          </Link>
                        )}

                        {meeting.has_notes && meeting.status === "completed" && (
                          <>
                            <Link href={`/meeting-notes/${meeting.id}`} className="flex-1 sm:flex-none">
                              <Button
                                size="sm"
                                className="glass-button bg-accent/20 border-accent/30 hover:bg-accent/30 w-full sm:w-auto"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">View Notes</span>
                                <span className="sm:hidden">Notes</span>
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              className="glass-button bg-transparent"
                              onClick={() => handleDownloadClick(meeting)}
                            >
                              <Download className="w-4 h-4" />
                              <span className="ml-2 hidden lg:inline">Download</span>
                            </Button>
                          </>
                        )}

                        {meeting.status === "failed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="glass-button bg-transparent flex-1 sm:flex-none"
                            onClick={() => {
                              alert("Retry functionality will be implemented")
                            }}
                          >
                            Retry
                          </Button>
                        )}

                        {meeting.status === "uploaded" && (
                          <Button
                            size="sm"
                            className="glass-button bg-primary/20 border-primary/30 hover:bg-primary/30 flex-1 sm:flex-none"
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem("token")
                                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/process/${meeting.id}`, {
                                  method: "POST",
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                  },
                                })

                                if (response.ok) {
                                  router.push(`/processing/${meeting.id}`)
                                }
                              } catch (error) {
                                console.error("Error starting processing:", error)
                              }
                            }}
                          >
                            <span className="hidden sm:inline">Start Processing</span>
                            <span className="sm:hidden">Process</span>
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          className="glass-button bg-transparent"
                          onClick={() => handleDeleteClick(meeting)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* Delete Confirmation Popup */}
      <AnimatePresence>
        {showDeletePopup && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeletePopup(false)}
            />
            
            {/* Popup Box */}
            <motion.div
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md mx-4 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white/90 p-6 shadow-2xl backdrop-blur-md text-center"
              initial={{ scale: 0.8, opacity: 0, y: -50 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }
              }}
              exit={{ 
                scale: 0.8, 
                opacity: 0,
                transition: { duration: 0.2 }
              }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: 1, 
                  rotate: 0,
                  transition: {
                    type: "spring",
                    stiffness: 200,
                    delay: 0.1
                  }
                }}
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20"
              >
                <Trash2 className="h-6 w-6 text-destructive" />
              </motion.div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Delete Meeting</h2>
              <p className="text-gray-700 mb-4 text-sm sm:text-base">
                Are you sure you want to delete "{selectedMeeting?.title}"? This action cannot be undone.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:space-x-4 sm:gap-0">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
                  <Button
                    onClick={() => setShowDeletePopup(false)}
                    variant="outline"
                    className="rounded-xl border-gray-300 px-5 py-2 text-gray-700 shadow hover:bg-gray-100 w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ 
                    x: 0, 
                    opacity: 1,
                    transition: { delay: 0.2 }
                  }}
                  className="flex-1 sm:flex-none"
                >
                  <Button
                    onClick={() => selectedMeeting && deleteMeeting(selectedMeeting.id)}
                    className="rounded-xl bg-destructive px-5 py-2 text-white shadow hover:bg-destructive/90 w-full sm:w-auto"
                  >
                    Delete
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Download Popup */}
      <AnimatePresence>
        {showDownloadPopup && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDownloading && setShowDownloadPopup(false)}
            />
            
            {/* Popup Box */}
            <motion.div
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md mx-4 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white/90 p-6 shadow-2xl backdrop-blur-md text-center"
              initial={{ scale: 0.8, opacity: 0, y: -50 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }
              }}
              exit={{ 
                scale: 0.8, 
                opacity: 0,
                transition: { duration: 0.2 }
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0,
                    transition: {
                      type: "spring",
                      stiffness: 200,
                      delay: 0.1
                    }
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20"
                >
                  <FileDown className="h-5 w-5 text-primary" />
                </motion.div>
                
                {!isDownloading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDownloadPopup(false)}
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Download Meeting Notes</h2>
              <p className="text-gray-700 mb-6 text-sm sm:text-base">
                Choose your preferred format for "{selectedMeeting?.title}"
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:space-x-4 sm:gap-0">
                <motion.div 
                  whileHover={{ scale: isDownloading ? 1 : 1.05 }} 
                  whileTap={{ scale: isDownloading ? 1 : 0.95 }}
                  className="flex-1 sm:flex-none"
                >
                  <Button
                    onClick={() => selectedMeeting && downloadMeeting(selectedMeeting.id, 'pdf')}
                    disabled={isDownloading}
                    className="rounded-xl bg-destructive px-5 py-2 text-white shadow hover:bg-destructive/90 disabled:opacity-50 w-full sm:w-auto"
                  >
                    {isDownloading && downloadType === 'pdf' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Download PDF
                      </>
                    )}
                  </Button>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: isDownloading ? 1 : 1.05 }} 
                  whileTap={{ scale: isDownloading ? 1 : 0.95 }}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ 
                    x: 0, 
                    opacity: 1,
                    transition: { delay: 0.2 }
                  }}
                  className="flex-1 sm:flex-none"
                >
                  <Button
                    onClick={() => selectedMeeting && downloadMeeting(selectedMeeting.id, 'word')}
                    disabled={isDownloading}
                    variant="outline"
                    className="rounded-xl border-primary/30 px-5 py-2 text-primary shadow hover:bg-primary/10 disabled:opacity-50 w-full sm:w-auto"
                  >
                    {isDownloading && downloadType === 'word' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Download Word
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
              
              {!isDownloading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.4 } }}
                  className="mt-4"
                >
                  <Button
                    onClick={() => setShowDownloadPopup(false)}
                    variant="ghost"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Popup */}
      <AnimatePresence>
        {showSuccessPopup && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessPopup(false)}
            />
            
            {/* Popup Box */}
            <motion.div
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md mx-4 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white/90 p-6 shadow-2xl backdrop-blur-md text-center"
              initial={{ scale: 0.8, opacity: 0, y: -50 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }
              }}
              exit={{ 
                scale: 0.8, 
                opacity: 0,
                transition: { duration: 0.2 }
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ 
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 200,
                    delay: 0.1
                  }
                }}
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/20"
              >
                <CheckCircle className="h-6 w-6 text-accent" />
              </motion.div>
              
              <motion.h2 
                className="text-xl sm:text-2xl font-bold text-gray-900 mb-2"
                initial={{ y: 10, opacity: 0 }}
                animate={{ 
                  y: 0, 
                  opacity: 1,
                  transition: { delay: 0.2 }
                }}
              >
                Success!
              </motion.h2>
              
              <motion.p 
                className="text-gray-700 mb-6 text-sm sm:text-base"
                initial={{ y: 10, opacity: 0 }}
                animate={{ 
                  y: 0, 
                  opacity: 1,
                  transition: { delay: 0.3 }
                }}
              >
                The operation completed successfully.
              </motion.p>
              
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                initial={{ y: 10, opacity: 0 }}
                animate={{ 
                  y: 0, 
                  opacity: 1,
                  transition: { delay: 0.4 }
                }}
              >
                <Button
                  onClick={() => setShowSuccessPopup(false)}
                  className="rounded-xl bg-primary px-5 py-2 text-white shadow hover:bg-primary/90 w-full sm:w-auto"
                >
                  Close
                </Button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}