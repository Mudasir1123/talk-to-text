"use client"

import type React from "react"
import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  FileAudio, 
  FileVideo, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square,
  Volume2 
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

interface UploadedFile {
  file: File
  preview?: string
  duration?: number
  isRecorded?: boolean
}

export default function UploadPage() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [title, setTitle] = useState("")
  const [detectedLanguage, setDetectedLanguage] = useState("Auto-detecting...")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showRecordingSuccess, setShowRecordingSuccess] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const router = useRouter()

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token")
    console.log("[DEBUG] Token found in localStorage:", !!token)
    if (!token) {
      console.warn("[WARN] No token found, redirecting to login")
      router.push("/login")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  // Updated supported formats to include .webm
  const supportedFormats = [".mp3", ".wav", ".mp4", ".avi", ".mov", ".m4a", ".flac", ".webm"]

  // Auto-detect language
  const detectLanguage = useCallback(async (file: File) => {
    console.log("[DEBUG] Starting language detection for file:", file.name)
    setDetectedLanguage("Detecting language...")
    
    // Simulate language detection
    setTimeout(() => {
      const languages = ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Russian", "Japanese", "Korean", "Chinese"]
      const detectedLang = languages[Math.floor(Math.random() * languages.length)]
      console.log("[DEBUG] Language detected:", detectedLang)
      setDetectedLanguage(detectedLang)
    }, 2000)
  }, [])

  // Voice recording
  const startRecording = async () => {
    console.log("[DEBUG] Starting voice recording")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      })
      
      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      const chunks: BlobPart[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log("[DEBUG] MediaRecorder data available:", event.data.size, "bytes")
          chunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        console.log("[DEBUG] Recording stopped")
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        
        const recordedFile = new File([blob], `recording-${Date.now()}.webm`, {
          type: 'audio/webm'
        })
        console.log("[DEBUG] Created file:", recordedFile.name, recordedFile.size, "bytes")
        
        const preview = URL.createObjectURL(blob)
        
        setUploadedFile({
          file: recordedFile,
          preview,
          isRecorded: true
        })
        
        // Auto-generate title
        if (!title) {
          const now = new Date()
          const timestamp = now.toLocaleString()
          setTitle(`Voice Recording - ${timestamp}`)
          console.log("[DEBUG] Auto-generated title:", `Voice Recording - ${timestamp}`)
        }
        
        detectLanguage(recordedFile)
        setShowRecordingSuccess(true)
        setTimeout(() => setShowRecordingSuccess(false), 3000)
        
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      setRecordingTime(0)
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (err) {
      console.error("[ERROR] Error accessing microphone:", err)
      setError("Unable to access microphone. Please check permissions.")
    }
  }

  const stopRecording = () => {
    console.log("[DEBUG] Stopping recording")
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    
    setIsRecording(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const playRecording = () => {
    if (audioRef.current && uploadedFile?.preview) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
        console.log("[DEBUG] Paused audio playback")
      } else {
        audioRef.current.play()
        setIsPlaying(true)
        console.log("[DEBUG] Started audio playback")
      }
    }
  }

  useEffect(() => {
    if (uploadedFile?.preview && !uploadedFile.isRecorded) {
      console.log("[DEBUG] Triggering language detection for uploaded file:", uploadedFile.file.name)
      detectLanguage(uploadedFile.file)
    }
  }, [uploadedFile, detectLanguage])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      console.log("[DEBUG] File dropped:", files[0].name, files[0].size, "bytes")
      handleFileSelection(files[0])
    }
  }, [])

  const handleFileSelection = (file: File) => {
    console.log("[DEBUG] File selected:", file.name, file.size, "bytes")
    setError("")
    setSuccess("")
    setDetectedLanguage("Auto-detecting...")

    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
    if (!supportedFormats.includes(fileExtension)) {
      console.error("[ERROR] Unsupported file format:", fileExtension)
      setError(`Unsupported file format. Please use: ${supportedFormats.join(", ")}`)
      return
    }

    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      console.error("[ERROR] File size too large:", file.size, "bytes")
      setError("File size too large. Maximum size is 100MB.")
      return
    }

    const preview = URL.createObjectURL(file)

    setUploadedFile({
      file,
      preview,
      isRecorded: false
    })

    if (!title) {
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "")
      setTitle(nameWithoutExtension)
      console.log("[DEBUG] Auto-generated title from filename:", nameWithoutExtension)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      console.log("[DEBUG] File input changed:", files[0].name)
      handleFileSelection(files[0])
    }
  }

  const removeFile = () => {
    console.log("[DEBUG] Removing file")
    if (uploadedFile?.preview) {
      URL.revokeObjectURL(uploadedFile.preview)
    }
    setUploadedFile(null)
    setTitle("")
    setDetectedLanguage("Auto-detecting...")
    setAudioBlob(null)
    setShowRecordingSuccess(false)
  }

  const handleUpload = async () => {
    if (!uploadedFile || !title.trim()) {
      console.error("[ERROR] Missing file or title:", { file: !!uploadedFile, title: title.trim() })
      setError("Please select a file and enter a title")
      return
    }

    console.log("[DEBUG] Starting upload:", {
      file: uploadedFile.file.name,
      size: uploadedFile.file.size,
      type: uploadedFile.file.type,
      title: title.trim(),
      language: "en"
    })

    setIsUploading(true)
    setUploadProgress(0)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", uploadedFile.file)
      formData.append("title", title.trim())
      formData.append("language", "en")

      const token = localStorage.getItem("token")
      console.log("[DEBUG] Using token:", token ? "Token present" : "No token")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()
      console.log("[DEBUG] Upload response:", { status: response.status, data })

      if (response.ok) {
        setSuccess("File uploaded successfully!")
        setUploadProgress(100)

        setTimeout(async () => {
          try {
            const processResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/process/${data.recording_id}`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            console.log("[DEBUG] Process response:", { status: processResponse.status })

            if (processResponse.ok) {
              console.log("[DEBUG] Redirecting to processing page:", `/processing/${data.recording_id}`)
              router.push(`/processing/${data.recording_id}`)
            } else {
              const processData = await processResponse.json()
              console.error("[ERROR] Processing failed:", processData)
              setError(processData.error || "Failed to start processing")
            }
          } catch (err) {
            console.error("[ERROR] Error starting processing:", err)
            setError("Network error during processing. Please try again.")
          }
        }, 1000)
      } else {
        console.error("[ERROR] Upload failed:", data)
        setError(data.error || "Upload failed")
      }
    } catch (err) {
      console.error("[ERROR] Network error during upload:", err)
      setError("Network error. Please check if the backend server is running.")
    } finally {
      setIsUploading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Upload Meeting Recording
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your meeting audio or video file and let our AI transform it into structured, actionable notes
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>File Upload</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all ${
                    dragActive
                      ? "border-primary bg-primary/10"
                      : uploadedFile
                        ? "border-accent bg-accent/10"
                        : "border-muted-foreground/30 hover:border-primary/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {uploadedFile ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-2">
                        {uploadedFile.file.type.startsWith("audio/") || uploadedFile.isRecorded ? (
                          <FileAudio className="w-8 h-8 text-accent" />
                        ) : (
                          <FileVideo className="w-8 h-8 text-accent" />
                        )}
                        <CheckCircle className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium break-words">{uploadedFile.file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(uploadedFile.file.size / (1024 * 1024)).toFixed(2)} MB
                          {uploadedFile.isRecorded && (
                            <Badge variant="secondary" className="ml-2 bg-accent/20 text-accent">
                              Recorded
                            </Badge>
                          )}
                        </p>
                      </div>
                      
                      {uploadedFile.isRecorded && uploadedFile.preview && (
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            onClick={playRecording}
                            size="sm"
                            variant="outline"
                            className="glass-button bg-transparent"
                          >
                            {isPlaying ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <Volume2 className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      
                      <Button onClick={removeFile} variant="outline" size="sm" className="glass-button bg-transparent">
                        <X className="w-4 h-4 mr-2" />
                        Remove File
                      </Button>
                      
                      <audio
                        ref={audioRef}
                        src={uploadedFile.preview}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-10 sm:w-12 h-10 sm:h-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-base sm:text-lg font-medium">Drop your file here</p>
                        <p className="text-sm sm:text-base text-muted-foreground">or click to browse</p>
                      </div>
                      <input
                        type="file"
                        accept={supportedFormats.join(",")}
                        onChange={handleFileInput}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button asChild variant="outline" className="glass-button bg-transparent">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          Choose File
                        </label>
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Supported formats: {supportedFormats.join(", ")}
                        <br />
                        Maximum size: 100MB
                      </p>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <div className="text-center mb-4">
                    <p className="text-sm font-medium text-muted-foreground">OR</p>
                  </div>
                  
                  <Card className="glass-card border-dashed border-primary/30 bg-primary/5">
                    <CardContent className="p-6 text-center">
                      <div className="space-y-4">
                        <motion.div
                          whileHover={{ scale: isRecording ? 1 : 1.05 }}
                          whileTap={{ scale: isRecording ? 1 : 0.95 }}
                        >
                          <Button
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={isUploading}
                            className={`w-20 h-20 rounded-full glass-button ${
                              isRecording 
                                ? 'bg-destructive/20 border-destructive/30 hover:bg-destructive/30 text-destructive' 
                                : 'bg-primary/20 border-primary/30 hover:bg-primary/30 text-primary'
                            } transition-all duration-300`}
                          >
                            {isRecording ? (
                              <Square className="w-8 h-8" />
                            ) : (
                              <Mic className="w-8 h-8" />
                            )}
                          </Button>
                        </motion.div>
                        
                        <div>
                          <p className="font-medium">
                            {isRecording ? "Recording in progress..." : "Record Voice"}
                          </p>
                          {isRecording && (
                            <div className="mt-2">
                              <p className="text-2xl font-mono text-primary">
                                {formatTime(recordingTime)}
                              </p>
                              <div className="flex justify-center mt-2">
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ repeat: Infinity, duration: 1 }}
                                  className="w-3 h-3 bg-destructive rounded-full"
                                />
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Click the microphone to start recording
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {uploadedFile?.preview && !uploadedFile.isRecorded && (
                  <div className="glass p-4 rounded-lg">
                    <Label className="text-sm font-medium mb-2 block">Preview</Label>
                    {uploadedFile.file.type.startsWith("audio/") ? (
                      <audio controls className="w-full">
                        <source src={uploadedFile.preview} type={uploadedFile.file.type} />
                        Your browser does not support the audio element.
                      </audio>
                    ) : (
                      <video controls className="w-full max-h-48 rounded">
                        <source src={uploadedFile.preview} type={uploadedFile.file.type} />
                        Your browser does not support the video element.
                      </video>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Meeting Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Meeting Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter meeting title"
                    className="glass"
                  />
                </div>

                <div className="glass p-4 rounded-lg">
                  <h3 className="font-medium mb-2">What happens next?</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• AI transcription of your audio</li>
                    <li>• Automatic language detection</li>
                    <li>• Text optimization and cleaning</li>
                    <li>• Intelligent meeting notes generation</li>
                    <li>• Structured summary with action items</li>
                  </ul>
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Uploading...</span>
                      <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {error && (
                  <Alert className="border-destructive/50 bg-destructive/10">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-destructive">{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-accent/50 bg-accent/10">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-accent">{success}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!uploadedFile || !title.trim() || isUploading}
                  className="w-full glass-button bg-primary/20 border-primary/30 hover:bg-primary/30 glow disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload & Process
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {showRecordingSuccess && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            
            <motion.div
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md mx-4 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white/90 backdrop-blur-md shadow-2xl text-center"
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
              <div className="p-6">
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
                  Recording Successful!
                </motion.h2>
                
                <motion.p 
                  className="text-gray-700 text-sm sm:text-base"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ 
                    y: 0, 
                    opacity: 1,
                    transition: { delay: 0.3 }
                  }}
                >
                  Your audio has been recorded successfully and is ready for processing.
                </motion.p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}