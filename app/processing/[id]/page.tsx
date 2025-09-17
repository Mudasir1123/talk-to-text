"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  FileText,
  ArrowRight,
  RefreshCw,
  Mic,
  Globe,
  Zap,
  Brain,
} from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

interface ProcessingStep {
  step: string
  status: string
  error?: string
  timestamp: string
}

interface ProcessingStatus {
  recording_id: number
  status: string
  processing_steps: ProcessingStep[]
  current_step_progress?: number
}

const processingSteps = [
  {
    key: "transcription",
    label: "AI Transcription",
    icon: Mic,
    description: "Converting speech to text"
  },
  {
    key: "translation",
    label: "Language Processing",
    icon: Globe,
    description: "Translating and optimizing text"
  },
  {
    key: "optimization",
    label: "Text Optimization",
    icon: Zap,
    description: "Cleaning and preparing content"
  },
  {
    key: "ai_generation",
    label: "AI Analysis",
    icon: Brain,
    description: "Generating meeting insights"
  },
]

export default function ProcessingPage({ params }: { params: { id: string } }) {
  const [status, setStatus] = useState<ProcessingStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState(0)
  const router = useRouter()
  const recordingId = params.id

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/processing-status/${recordingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStatus(data)

        // Calculate progress based on steps
        const stepOrder = ["transcription", "translation", "optimization", "ai_generation"]
        let totalProgress = 0

        // Find completed steps and current step
        const completedSteps = stepOrder.filter(stepKey =>
          data.processing_steps.some((s: ProcessingStep) => 
            s.step === stepKey && s.status === "success"
          )
        )

        const currentStep = data.processing_steps.find((s: ProcessingStep) => 
          s.status === "in_progress"
        )

        // Each completed step contributes 25%
        totalProgress = completedSteps.length * 25

        // Add progress within current step
        if (currentStep) {
          const currentStepIndex = stepOrder.indexOf(currentStep.step)
          if (currentStepIndex !== -1) {
            const stepBaseProgress = currentStepIndex * 25
            const withinStepProgress = data.current_step_progress || 0
            totalProgress = stepBaseProgress + withinStepProgress
          }
        }

        // Ensure progress only increases and caps at 100
        const newProgress = Math.min(100, Math.max(progress, totalProgress))
        setProgress(newProgress)

        // Check if processing is complete
        if (data.status === "completed") {
          setProgress(100)
          setTimeout(() => {
            router.push(`/meeting-notes/${recordingId}`)
          }, 2000)
        }
      } else {
        setError("Failed to fetch processing status")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    // Poll for updates every 2 seconds for more responsive UI
    const interval = setInterval(fetchStatus, 2000)
    return () => clearInterval(interval)
  }, [recordingId, router])

  const getStepStatus = (stepKey: string) => {
    if (!status) return "pending"
    const step = status.processing_steps.find((s) => s.step === stepKey)
    if (!step) return "pending"
    return step.status
  }

  const getStepIcon = (stepKey: string, IconComponent: any) => {
    const stepStatus = getStepStatus(stepKey)
    switch (stepStatus) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-accent" />
      case "in_progress":
        return <Loader2 className="w-6 h-6 text-primary animate-spin" />
      case "failed":
        return <AlertCircle className="w-6 h-6 text-destructive" />
      default:
        return <Clock className="w-6 h-6 text-muted-foreground" />
    }
  }

  const getStepProgress = (stepKey: string) => {
    if (!status) return 0
    const stepOrder = ["transcription", "translation", "optimization", "ai_generation"]
    const stepIndex = stepOrder.indexOf(stepKey)
    const stepStatus = getStepStatus(stepKey)
    
    if (stepStatus === "success") {
      return 100
    } else if (stepStatus === "in_progress") {
      return Math.min(100, (status.current_step_progress || 0) * 4) // Scale 0-25 to 0-100
    } else {
      return 0
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading processing status...</p>
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-4 glow floating">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              AI Processing in Progress
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our advanced AI is analyzing your meeting recording and generating intelligent insights
            </p>
          </div>

          {error && (
            <Alert className="mb-8 border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}

          {/* Overall Progress */}
          <Card className="glass-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Processing Progress</span>
                <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="h-3 mb-4" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Status: <span className="text-foreground font-medium">{status?.status || "Processing"}</span>
                </span>
                <Button onClick={fetchStatus} variant="ghost" size="sm" className="glass-button">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Processing Steps */}
          <div className="space-y-4">
            {processingSteps.map((step, index) => {
              const stepStatus = getStepStatus(step.key)
              const stepProgress = getStepProgress(step.key)
              const isActive = stepStatus === "in_progress"
              const isCompleted = stepStatus === "success"
              const isFailed = stepStatus === "failed"

              return (
                <Card
                  key={step.key}
                  className={`glass-card smooth-transition ${
                    isActive
                      ? "ring-2 ring-primary glow"
                      : isCompleted
                      ? "ring-1 ring-accent"
                      : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">{getStepIcon(step.key, step.icon)}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">{step.label}</h3>
                        <p className="text-muted-foreground text-sm">{step.description}</p>
                        
                        {/* Individual step progress bar */}
                        {isActive && (
                          <div className="mt-3">
                            <Progress value={stepProgress} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              Step progress: {Math.round(stepProgress)}%
                            </p>
                          </div>
                        )}

                        {isFailed && (
                          <p className="text-destructive text-sm mt-1">
                            Error: {status?.processing_steps.find((s) => s.step === step.key)?.error}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {isCompleted && <span className="text-accent text-sm font-medium">Completed</span>}
                        {isActive && <span className="text-primary text-sm font-medium">Processing...</span>}
                        {isFailed && <span className="text-destructive text-sm font-medium">Failed</span>}
                        {stepStatus === "pending" && (
                          <span className="text-muted-foreground text-sm font-medium">Pending</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Completion Message */}
          {status?.status === "completed" && (
            <Card className="glass-card mt-8 ring-2 ring-accent glow-green">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-accent" />
                <h3 className="text-xl font-semibold mb-2">Processing Complete!</h3>
                <p className="text-muted-foreground mb-4">
                  Your meeting has been successfully analyzed. Redirecting to your notes...
                </p>
                <Button
                  onClick={() => router.push(`/meeting-notes/${recordingId}`)}
                  className="glass-button bg-accent/20 border-accent/30 hover:bg-accent/30 glow-green"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Meeting Notes
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* What's Happening */}
          <Card className="glass-card mt-8">
            <CardHeader>
              <CardTitle>What's Happening Behind the Scenes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-medium text-foreground mb-2">AI Transcription</h4>
                  <p>Advanced speech recognition converts your audio to accurate text with 95%+ accuracy.</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Language Processing</h4>
                  <p>Automatic language detection and translation to English if needed.</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Text Optimization</h4>
                  <p>Cleaning filler words, improving readability, and preparing for AI analysis.</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">AI Analysis</h4>
                  <p>Gemini AI generates structured notes with summaries, action items, and insights.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer />
    </div>
  )
}