"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  FileText,
  Download,
  Share,
  Calendar,
  CheckSquare,
  Lightbulb,
  TrendingUp,
  ArrowLeft,
  Copy,
  Loader2,
  AlertCircle,
  Check,
  X,
  Languages,
  Mail,
  Upload,
  RefreshCw,
} from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

interface MeetingData {
  id: number
  title: string
  filename: string
  upload_date: string
  status: string
  transcription: {
    raw: string
    translated: string
    optimized: string
  }
  notes: {
    summary: string
    key_points: string | string[]
    action_items: string | string[]
    decisions: string | string[]
    sentiment: string
  }
}

export default function MeetingNotesPage({ params }: { params: { id: string } }) {
  const [meeting, setMeeting] = useState<MeetingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("summary")
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [downloadModalOpen, setDownloadModalOpen] = useState(false)
  const [translationText, setTranslationText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("es")
  const [isTranslating, setIsTranslating] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [downloadingWord, setDownloadingWord] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Email form state
  const [emailForm, setEmailForm] = useState({
    to: "",
    from: "muhammadrizwantahir23@gmail.com",
    subject: "",
    body: ""
  })
  
  const router = useRouter()
  const meetingId = params.id

  const languages = [
    { code: "auto", name: "Auto" },
    { code: "af", name: "Afrikaans" },
    { code: "sq", name: "Albanian" },
    { code: "am", name: "Amharic" },
    { code: "ar", name: "Arabic" },
    { code: "hy", name: "Armenian" },
    { code: "as", name: "Assamese" },
    { code: "ay", name: "Aymara" },
    { code: "az", name: "Azerbaijani" },
    { code: "bm", name: "Bambara" },
    { code: "eu", name: "Basque" },
    { code: "be", name: "Belarusian" },
    { code: "bn", name: "Bengali" },
    { code: "bho", name: "Bhojpuri" },
    { code: "bs", name: "Bosnian" },
    { code: "bg", name: "Bulgarian" },
    { code: "my", name: "Burmese" },
    { code: "ca", name: "Catalan" },
    { code: "ceb", name: "Cebuano" },
    { code: "zh-cn", name: "Chinese (Simplified)" },
    { code: "zh-tw", name: "Chinese (Traditional)" },
    { code: "co", name: "Corsican" },
    { code: "hr", name: "Croatian" },
    { code: "cs", name: "Czech" },
    { code: "da", name: "Danish" },
    { code: "dv", name: "Dhivehi" },
    { code: "doi", name: "Dogri" },
    { code: "nl", name: "Dutch" },
    { code: "en", name: "English" },
    { code: "eo", name: "Esperanto" },
    { code: "et", name: "Estonian" },
    { code: "ee", name: "Ewe" },
    { code: "tl", name: "Filipino" },
    { code: "fi", name: "Finnish" },
    { code: "fr", name: "French" },
    { code: "fy", name: "Frisian" },
    { code: "gl", name: "Galician" },
    { code: "ka", name: "Georgian" },
    { code: "de", name: "German" },
    { code: "el", name: "Greek" },
    { code: "gn", name: "Guarani" },
    { code: "gu", name: "Gujarati" },
    { code: "ht", name: "Haitian Creole" },
    { code: "ha", name: "Hausa" },
    { code: "haw", name: "Hawaiian" },
    { code: "iw", name: "Hebrew" },
    { code: "hi", name: "Hindi" },
    { code: "hmn", name: "Hmong" },
    { code: "hu", name: "Hungarian" },
    { code: "is", name: "Icelandic" },
    { code: "ig", name: "Igbo" },
    { code: "ilo", name: "Ilocano" },
    { code: "id", name: "Indonesian" },
    { code: "ga", name: "Irish" },
    { code: "it", name: "Italian" },
    { code: "ja", name: "Japanese" },
    { code: "jw", name: "Javanese" },
    { code: "kn", name: "Kannada" },
    { code: "kk", name: "Kazakh" },
    { code: "km", name: "Khmer" },
    { code: "rw", name: "Kinyarwanda" },
    { code: "gom", name: "Konkani" },
    { code: "ko", name: "Korean" },
    { code: "kri", name: "Krio" },
    { code: "ku", name: "Kurdish" },
    { code: "ky", name: "Kyrgyz" },
    { code: "lo", name: "Lao" },
    { code: "la", name: "Latin" },
    { code: "lv", name: "Latvian" },
    { code: "ln", name: "Lingala" },
    { code: "lt", name: "Lithuanian" },
    { code: "lb", name: "Luxembourgish" },
    { code: "mk", name: "Macedonian" },
    { code: "mai", name: "Maithili" },
    { code: "mg", name: "Malagasy" },
    { code: "ms", name: "Malay" },
    { code: "ml", name: "Malayalam" },
    { code: "mt", name: "Maltese" },
    { code: "mni-mtei", name: "Manipuri (Meitei)" },
    { code: "mi", name: "Maori" },
    { code: "mr", name: "Marathi" },
    { code: "lus", name: "Mizo" },
    { code: "mn", name: "Mongolian" },
    { code: "ne", name: "Nepali" },
    { code: "no", name: "Norwegian" },
    { code: "ny", name: "Nyanja (Chichewa)" },
    { code: "or", name: "Odia (Oriya)" },
    { code: "om", name: "Oromo" },
    { code: "ps", name: "Pashto" },
    { code: "fa", name: "Persian" },
    { code: "pl", name: "Polish" },
    { code: "pt", name: "Portuguese" },
    { code: "pa", name: "Punjabi" },
    { code: "qu", name: "Quechua" },
    { code: "ro", name: "Romanian" },
    { code: "ru", name: "Russian" },
    { code: "sm", name: "Samoan" },
    { code: "sa", name: "Sanskrit" },
    { code: "gd", name: "Scots Gaelic" },
    { code: "sr", name: "Serbian" },
    { code: "st", name: "Sesotho" },
    { code: "sn", name: "Shona" },
    { code: "sd", name: "Sindhi" },
    { code: "si", name: "Sinhala" },
    { code: "sk", name: "Slovak" },
    { code: "sl", name: "Slovenian" },
    { code: "so", name: "Somali" },
    { code: "es", name: "Spanish" },
    { code: "su", name: "Sundanese" },
    { code: "sw", name: "Swahili" },
    { code: "sv", name: "Swedish" },
    { code: "ta", name: "Tamil" },
    { code: "tt", name: "Tatar" },
    { code: "te", name: "Telugu" },
    { code: "th", name: "Thai" },
    { code: "ti", name: "Tigrinya" },
    { code: "ts", name: "Tsonga" },
    { code: "tr", name: "Turkish" },
    { code: "tk", name: "Turkmen" },
    { code: "ak", name: "Twi (Akan)" },
    { code: "uk", name: "Ukrainian" },
    { code: "ur", name: "Urdu" },
    { code: "ug", name: "Uyghur" },
    { code: "uz", name: "Uzbek" },
    { code: "vi", name: "Vietnamese" },
    { code: "cy", name: "Welsh" },
    { code: "xh", name: "Xhosa" },
    { code: "yi", name: "Yiddish" },
    { code: "yo", name: "Yoruba" },
    { code: "zu", name: "Zulu" },
  ]

  // Token management
  const refreshTokenIfNeeded = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return false

      // Check if token is still valid
      const validateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/validate`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (validateResponse.ok) return true

      // Try to refresh token
      const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (refreshResponse.ok) {
        const data = await refreshResponse.json()
        localStorage.setItem("token", data.access_token)
        console.log("Token refreshed successfully")
        return true
      }

      return false
    } catch (error) {
      console.error("Token refresh error:", error)
      return false
    }
  }

  // Enhanced authenticated request function
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const tokenValid = await refreshTokenIfNeeded()
    if (!tokenValid) {
      router.push("/login")
      throw new Error("Authentication failed")
    }

    const token = localStorage.getItem("token")
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    }

    const response = await fetch(url, { ...options, headers })

    if (response.status === 401) {
      localStorage.removeItem("token")
      router.push("/login")
      throw new Error("Authentication expired")
    }

    return response
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    fetchMeetingDetails()
  }, [meetingId, router])

  useEffect(() => {
    // Pre-populate email form when meeting data is available
    if (meeting) {
      setEmailForm(prev => ({
        ...prev,
        subject: `Meeting Notes: ${meeting.title}`,
        body: `Dear Recipient,

I hope this email finds you well. Please find attached the meeting notes from "${meeting.title}" held on ${new Date(meeting.upload_date).toLocaleDateString()}.

The attached PDF contains:
- Executive Summary
- Key Discussion Points
- Action Items
- Decisions Made
- Full Transcript

Please review the document and let me know if you have any questions or need clarification on any points discussed.

Best regards`
      }))
    }
  }, [meeting])

  // Automatic token refresh on app focus
  useEffect(() => {
    const handleFocus = () => {
      refreshTokenIfNeeded()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  // Periodic token refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refreshTokenIfNeeded()
    }, 5 * 60 * 1000) // Check every 5 minutes

    return () => clearInterval(interval)
  }, [])

  const fetchMeetingDetails = async () => {
    try {
      setIsRefreshing(true)
      const tokenValid = await refreshTokenIfNeeded()
      if (!tokenValid) {
        router.push("/login")
        return
      }

      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/meetings/${meetingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      if (response.ok) {
        const data = await response.json()
        setMeeting(data.meeting)
        
        // Debug log to check key points
        console.log("Meeting data received:", data.meeting)
        console.log("Key points raw:", data.meeting.notes.key_points)
        console.log("Key points parsed:", parseJsonField(data.meeting.notes.key_points))
      } else {
        setError("Failed to load meeting details")
      }
    } catch (err) {
      console.error("Fetch error:", err)
      setError("Network error occurred")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Improved parseJsonField function
  const parseJsonField = (field: string | string[]) => {
    // Return empty array if field is null, undefined, or empty
    if (!field || field === "" || field === "[]" || field === "{}") {
      return []
    }

    // If already an array, return it
    if (Array.isArray(field)) {
      return field.filter(item => item && item.trim() !== "")
    }

    // If it's a string, try to parse it
    if (typeof field === 'string') {
      try {
        // Try parsing as JSON first
        const parsed = JSON.parse(field)
        if (Array.isArray(parsed)) {
          return parsed.filter(item => item && item.trim() !== "")
        }
        // If parsed but not array, wrap in array
        return [parsed].filter(item => item && item.trim() !== "")
      } catch {
        // If JSON parsing fails, try other formats
        
        // Check if it looks like a stringified array
        if (field.startsWith('[') && field.endsWith(']')) {
          try {
            // Remove brackets and split by comma, then clean up
            const items = field.slice(1, -1).split('","').map(item => 
              item.replace(/^"/, '').replace(/"$/, '').trim()
            )
            return items.filter(item => item && item !== '')
          } catch {
            // If that fails, return the original string as single item
            return [field]
          }
        }
        
        // Split by newlines or other separators
        if (field.includes('\n')) {
          return field.split('\n').filter(item => item.trim() !== '')
        }
        
        // If all else fails, return as single item array
        return [field]
      }
    }

    return []
  }

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates(prev => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const downloadPDF = async () => {
    if (!meeting) return
    
    setDownloadingPdf(true)
    try {
      const response = await makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/api/export/${meeting.id}/pdf`
      )

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `meeting-notes-${meeting.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        window.URL.revokeObjectURL(url)
        setDownloadModalOpen(false)
        
        alert("PDF downloaded successfully!")
      } else {
        alert("Failed to generate PDF")
      }
    } catch (error) {
      console.error("PDF download error:", error)
      alert("Error downloading PDF")
    } finally {
      setDownloadingPdf(false)
    }
  }

  const downloadWord = async () => {
    if (!meeting) return
    
    setDownloadingWord(true)
    try {
      const response = await makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/api/export/${meeting.id}/word`
      )

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `meeting-notes-${meeting.title.replace(/[^a-zA-Z0-9]/g, '-')}.docx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        window.URL.revokeObjectURL(url)
        setDownloadModalOpen(false)
        
        setTimeout(() => {
          alert("Word document downloaded successfully! The file should open automatically in Microsoft Word. If it doesn't open, please locate the downloaded file and double-click it.")
        }, 500)
      } else {
        alert("Failed to generate Word document")
      }
    } catch (error) {
      console.error("Word download error:", error)
      alert("Error downloading Word document")
    } finally {
      setDownloadingWord(false)
    }
  }

  const generatePdfForEmail = async () => {
    if (!meeting) return
    
    setGeneratingPdf(true)
    try {
      const response = await makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/api/export/${meeting.id}/pdf`
      )

      if (response.ok) {
        const blob = await response.blob()
        const file = new File([blob], `meeting-notes-${meeting.id}.pdf`, { type: 'application/pdf' })
        setPdfFile(file)
      } else {
        alert("Failed to generate PDF")
      }
    } catch (error) {
      console.error("PDF generation error:", error)
      alert("Error generating PDF")
    } finally {
      setGeneratingPdf(false)
    }
  }

  const sendEmail = async () => {
    if (!meeting || !emailForm.to || !emailForm.subject) {
      alert("Please fill in all required fields")
      return
    }

    if (!pdfFile) {
      alert("Please generate PDF first")
      return
    }

    setIsSendingEmail(true)
    try {
      const formData = new FormData()
      formData.append('meeting_id', meeting.id.toString())
      formData.append('to_email', emailForm.to)
      formData.append('from_email', 'muhammadrizwantahir23@gmail.com')
      formData.append('subject', emailForm.subject)
      formData.append('body', emailForm.body)
      formData.append('pdf_file', pdfFile)

      const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/send-email`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        alert("Email sent successfully!")
        setEmailModalOpen(false)
        setPdfFile(null)
      } else {
        alert("Failed to send email")
      }
    } catch (error) {
      console.error("Email sending error:", error)
      alert("Error sending email")
    } finally {
      setIsSendingEmail(false)
    }
  }

  const translateText = async () => {
    if (!translationText.trim()) {
      alert("Please enter text to translate")
      return
    }
    
    setIsTranslating(true)
    try {
      const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: translationText,
          target_language: selectedLanguage
        })
      })

      if (response.ok) {
        const data = await response.json()
        setTranslatedText(data.translated_text)
      } else {
        const error = await response.json()
        alert(`Translation failed: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error("Translation error:", error)
      alert("Translation error occurred")
    } finally {
      setIsTranslating(false)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "text-accent"
      case "negative":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "😊"
      case "negative":
        return "😟"
      default:
        return "😐"
    }
  }

  const CopyButton = ({ text, copyKey }: { text: string, copyKey: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="absolute top-4 right-4 h-8 w-8 p-0 opacity-60 hover:opacity-100"
      onClick={() => copyToClipboard(text, copyKey)}
    >
      {copiedStates[copyKey] ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </Button>
  )

  // Debug component for development
  const DebugKeyPoints = () => {
    if (process.env.NODE_ENV !== 'development') return null
    
    const keyPoints = parseJsonField(meeting?.notes.key_points || [])
    
    return (
      <details className="mb-4 p-4 bg-muted/20 rounded">
        <summary className="cursor-pointer font-medium">Debug: Key Points Data</summary>
        <pre className="mt-2 text-xs overflow-auto">
          Raw key_points: {JSON.stringify(meeting?.notes.key_points, null, 2)}
          Parsed key_points: {JSON.stringify(keyPoints, null, 2)}
          Type: {typeof meeting?.notes.key_points}
          Length: {keyPoints.length}
        </pre>
      </details>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading meeting notes...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-destructive">{error || "Meeting not found"}</AlertDescription>
            </Alert>
            <div className="mt-4 flex justify-center">
              <Button onClick={() => fetchMeetingDetails()} disabled={isRefreshing}>
                {isRefreshing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Retry
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const keyPoints = parseJsonField(meeting.notes.key_points)
  const actionItems = parseJsonField(meeting.notes.action_items)
  const decisions = parseJsonField(meeting.notes.decisions)

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Debug component - only shows in development */}
          <DebugKeyPoints />

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <Button onClick={() => router.back()} variant="outline" className="glass-button bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => fetchMeetingDetails()}
                variant="outline"
                size="sm"
                className="glass-button bg-transparent"
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
              <Button
                onClick={() => setShareModalOpen(true)}
                variant="outline"
                size="sm"
                className="glass-button bg-transparent"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={() => setDownloadModalOpen(true)}
                className="glass-button bg-primary/20 border-primary/30 hover:bg-primary/30"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Notes
              </Button>
            </div>
          </div>

          {/* Share Modal */}
          <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
            <DialogContent className="glass-card sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share Meeting Notes</DialogTitle>
                <DialogDescription>
                  Send your meeting notes via email
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col space-y-4 py-4">
                <Button
                  onClick={() => {
                    setShareModalOpen(false)
                    setEmailModalOpen(true)
                  }}
                  className="flex items-center justify-center space-x-3 p-6 glass-button bg-primary/10 hover:bg-primary/20 border border-primary/30"
                >
                  <Mail className="w-6 h-6 text-primary" />
                  <span className="font-medium">Send via Email</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Download Modal */}
          <Dialog open={downloadModalOpen} onOpenChange={setDownloadModalOpen}>
            <DialogContent className="glass-card sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Download Meeting Notes</DialogTitle>
                <DialogDescription>
                  Choose your preferred format to download
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col space-y-4 py-4">
                <Button
                  onClick={downloadPDF}
                  disabled={downloadingPdf}
                  className="flex items-center justify-center space-x-3 p-6 glass-button bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-left"
                >
                  {downloadingPdf ? (
                    <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
                  ) : (
                    <FileText className="w-6 h-6 text-red-500" />
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium text-red-500">Download as PDF</span>
                    <span className="text-xs text-muted-foreground">Portable Document Format</span>
                  </div>
                </Button>
                <Button
                  onClick={downloadWord}
                  disabled={downloadingWord}
                  className="flex items-center justify-center space-x-3 p-6 glass-button bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-left"
                >
                  {downloadingWord ? (
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  ) : (
                    <FileText className="w-6 h-6 text-blue-500" />
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium text-blue-500">Download as Word</span>
                    <span className="text-xs text-muted-foreground">Opens in Microsoft Word</span>
                  </div>
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Email Modal */}
          <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
          <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-3xl">   
              <DialogHeader>
                <DialogTitle>Compose Email</DialogTitle>
                <DialogDescription>
                  Send the meeting notes PDF via email
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email-to">To *</Label>
                    <Input
                      id="email-to"
                      type="email"
                      placeholder="recipient@example.com"
                      value={emailForm.to}
                      onChange={(e) => setEmailForm(prev => ({...prev, to: e.target.value}))}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email-from">From *</Label>
                    <Input
                    id="email-from"
                    type="email"
                    value="muhammadrizwantahir23@gmail.com"
                    className="mt-1 bg-muted/50 cursor-not-allowed"
                   readOnly
                  />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email-subject">Subject *</Label>
                  <Input
                    id="email-subject"
                    type="text"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm(prev => ({...prev, subject: e.target.value}))}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email-body">Message</Label>
                  <Textarea
                    id="email-body"
                    value={emailForm.body}
                    onChange={(e) => setEmailForm(prev => ({...prev, body: e.target.value}))}
                    className="mt-1 min-h-[100px] resize-none"
                    placeholder="Enter your message..."
                  />
                </div>
                
                {/* PDF Upload Section */}
                <div className="border border-dashed border-muted-foreground/30 rounded-lg p-4">
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">PDF Attachment</p>
                      {!pdfFile ? (
                        <Button
                          onClick={generatePdfForEmail}
                          disabled={generatingPdf}
                          variant="outline"
                          size="sm"
                        >
                          {generatingPdf ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <FileText className="w-4 h-4 mr-2" />
                          )}
                          Generate PDF
                        </Button>
                      ) : (
                        <div className="flex items-center space-x-2 text-sm text-green-600">
                          <Check className="w-4 h-4" />
                          <span>{pdfFile.name}</span>
                          <Button
                            onClick={() => setPdfFile(null)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setEmailModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={sendEmail} disabled={isSendingEmail || !pdfFile}>
                    {isSendingEmail ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    Send Email
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Meeting Info */}
          <Card className="glass-card mb-8">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent break-words">
                    {meeting.title}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(meeting.upload_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="w-4 h-4" />
                      <span className="truncate max-w-[150px] sm:max-w-none">{meeting.filename}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className={`${getSentimentColor(meeting.notes.sentiment)} text-justify`}>
                        {getSentimentIcon(meeting.notes.sentiment)} {meeting.notes.sentiment || "Neutral"}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30 mt-4 lg:mt-0 self-start">
                  Completed
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Summary Card */}
            <div className="xl:col-span-1">
              <Card className="glass-card xl:sticky xl:top-24">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Lightbulb className="w-5 h-5" />
                    <span>Quick Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed text-justify">
                    {meeting.notes.summary || "No summary available"}
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Key Points</span>
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        {keyPoints.length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Action Items</span>
                      <Badge variant="outline" className="border-accent/30 text-accent">
                        {actionItems.length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Decisions</span>
                      <Badge variant="outline" className="border-muted/30 text-muted-foreground">
                        {decisions.length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Content */}
            <div className="xl:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="overflow-x-auto">
                  <TabsList className="glass w-full min-w-max justify-start">
                    <TabsTrigger value="summary" className="flex items-center space-x-2 whitespace-nowrap">
                      <Lightbulb className="w-4 h-4" />
                      <span>Summary</span>
                    </TabsTrigger>
                    <TabsTrigger value="key-points" className="flex items-center space-x-2 whitespace-nowrap">
                      <FileText className="w-4 h-4" />
                      <span>Key Points ({keyPoints.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="actions" className="flex items-center space-x-2 whitespace-nowrap">
                      <CheckSquare className="w-4 h-4" />
                      <span>Actions ({actionItems.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="transcript" className="flex items-center space-x-2 whitespace-nowrap">
                      <FileText className="w-4 h-4" />
                      <span>Transcript</span>
                    </TabsTrigger>
                    <TabsTrigger value="translate" className="flex items-center space-x-2 whitespace-nowrap">
                      <Languages className="w-4 h-4" />
                      <span>Translate</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="summary" className="space-y-6">
                  <Card className="glass-card relative">
                    <CardHeader>
                      <CardTitle>Meeting Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground leading-relaxed text-justify">
                        {meeting.notes.summary || "No summary available"}
                      </p>
                    </CardContent>
                    <CopyButton text={meeting.notes.summary || ""} copyKey="summary" />
                  </Card>

                  {decisions.length > 0 && (
                    <Card className="glass-card relative">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <CheckSquare className="w-5 h-5" />
                          <span>Key Decisions</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {decisions.map((decision: string, index: number) => (
                            <li key={index} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-foreground text-justify">{decision}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CopyButton text={decisions.join('\n')} copyKey="decisions" />
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="key-points" className="space-y-6">
                  <Card className="glass-card relative">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Key Discussion Points</span>
                        <Badge variant="outline" className="border-primary/30 text-primary">
                          {keyPoints.length} points
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {keyPoints.length > 0 ? (
                        <ul className="space-y-4">
                          {keyPoints.map((point: string, index: number) => (
                            <li key={index} className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0 mt-0.5">
                                {index + 1}
                              </div>
                              <span className="text-foreground leading-relaxed text-justify">{point}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            No key points were extracted from this meeting.
                            <br />
                            <span className="text-sm">This might happen with very short or unclear audio.</span>
                          </p>
                          <Button 
                            onClick={() => fetchMeetingDetails()} 
                            variant="outline" 
                            size="sm" 
                            className="mt-4"
                            disabled={isRefreshing}
                          >
                            {isRefreshing ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4 mr-2" />
                            )}
                            Refresh Data
                          </Button>
                        </div>
                      )}
                    </CardContent>
                    {keyPoints.length > 0 && (
                      <CopyButton text={keyPoints.join('\n')} copyKey="keyPoints" />
                    )}
                  </Card>
                </TabsContent>

                <TabsContent value="actions" className="space-y-6">
                  <Card className="glass-card relative">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CheckSquare className="w-5 h-5" />
                        <span>Action Items</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {actionItems.length > 0 ? (
                        <ul className="space-y-4">
                          {actionItems.map((action: string, index: number) => (
                            <li key={index} className="flex items-start space-x-3 p-3 glass rounded-lg">
                              <CheckSquare className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                              <span className="text-foreground leading-relaxed text-justify">{action}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground text-justify">No action items identified</p>
                      )}
                    </CardContent>
                    <CopyButton text={actionItems.join('\n')} copyKey="actionItems" />
                  </Card>

                  {decisions.length > 0 && (
                    <Card className="glass-card relative">
                      <CardHeader>
                        <CardTitle>Decisions Made</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {decisions.map((decision: string, index: number) => (
                            <li key={index} className="flex items-start space-x-3 p-3 glass rounded-lg">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-foreground text-justify">{decision}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CopyButton text={decisions.join('\n')} copyKey="decisionsTab" />
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="transcript" className="space-y-6">
                  <Card className="glass-card relative">
                    <CardHeader>
                      <CardTitle>Full Transcript</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap break-words text-justify">
                          {meeting.transcription.optimized ||
                            meeting.transcription.translated ||
                            meeting.transcription.raw ||
                            "No transcript available"}
                        </p>
                      </div>
                    </CardContent>
                    <CopyButton 
                      text={meeting.transcription.optimized || meeting.transcription.translated || meeting.transcription.raw || ""} 
                      copyKey="transcript" 
                    />
                  </Card>
                </TabsContent>

                <TabsContent value="translate" className="space-y-6">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Languages className="w-5 h-5" />
                        <span>Text Translation</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="translate-text">Text to Translate</Label>
                        <Textarea
                          id="translate-text"
                          placeholder="Enter text to translate..."
                          value={translationText}
                          onChange={(e) => setTranslationText(e.target.value)}
                          className="min-h-[100px] mt-1 resize-none text-justify"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="target-language">Target Language</Label>
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                          <SelectTrigger className="mt-1 bg-background border-input">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border-input">
                            {languages.map((lang) => (
                              <SelectItem 
                                key={lang.code} 
                                value={lang.code}
                                className="text-foreground hover:bg-muted focus:bg-muted"
                              >
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button 
                        onClick={translateText} 
                        disabled={isTranslating || !translationText.trim()}
                        className="w-full"
                      >
                        {isTranslating ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Languages className="w-4 h-4 mr-2" />
                        )}
                        Translate
                      </Button>
                      
                      {translatedText && (
                        <div className="space-y-2">
                          <Label>Translation Result</Label>
                          <div className="relative">
                            <Textarea
                              value={translatedText}
                              readOnly
                              className="min-h-[100px] bg-muted/50 resize-none text-justify"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 h-8 w-8 p-0 opacity-60 hover:opacity-100"
                              onClick={() => copyToClipboard(translatedText, "translation")}
                            >
                              {copiedStates.translation ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <div className="p-4 bg-muted/20 rounded-lg border border-muted/20">
                        <h4 className="font-medium mb-3 flex items-center space-x-2">
                          <Lightbulb className="w-4 h-4" />
                          <span>Quick Actions</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTranslationText(meeting.notes.summary || "")}
                            className="justify-start text-left h-auto py-2 px-3"
                          >
                            <span className="truncate">Translate Summary</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTranslationText(keyPoints.join('\n'))}
                            className="justify-start text-left h-auto py-2 px-3"
                          >
                            <span className="truncate">Translate Key Points</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTranslationText(actionItems.join('\n'))}
                            className="justify-start text-left h-auto py-2 px-3"
                          >
                            <span className="truncate">Translate Actions</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTranslationText(
                              meeting.transcription.optimized ||
                              meeting.transcription.translated ||
                              meeting.transcription.raw ||
                              ""
                            )}
                            className="justify-start text-left h-auto py-2 px-3"
                          >
                            <span className="truncate">Translate Transcript</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}