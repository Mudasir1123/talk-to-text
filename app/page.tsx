'use client'; // Required for client-side fetching
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Zap, Shield, Globe, ArrowRight, Play } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { toast } from "sonner"; // For error notifications

export default function HomePagfette() {
  const [backendStatus, setBackendStatus] = useState<string | null>(null);

  useEffect(() => {
    async function checkBackend() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/`);
        const data = await response.json();
        setBackendStatus(data.status);
      } catch (error) {
        toast.error("Failed to connect to backend");
        console.error("Backend fetch error:", error);
      }
    }
    checkBackend();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Backend Status */}
      <div className="text-center py-4">
        <p className="text-white/80">
          Backend Status: {backendStatus || "Checking..."}
        </p>
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="floating">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Transform Meetings into</span>
              <br />
              <span className="gradient-text ">Actionable Insights</span>
            </h1>
          </div>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            AI-powered transcription and intelligent note generation that turns your meeting recordings into structured,
            actionable documentation in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/upload">
              <Button
                size="lg"
                className="glass-button bg-primary/20 border-primary/30 hover:bg-primary/30 glow text-white"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Upload
              </Button>
            </Link>
            <Link href="/about">
              <Button
                variant="outline"
                size="lg"
                className="glass-button bg-transparent text-white border-white/30 hover:bg-white/10"
              >
                Learn More
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Powered by Advanced AI</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Experience the future of meeting documentation with cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="glass-card smooth-transition scale-hover">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-4 glow">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">AI Transcription</h3>
                <p className="text-white/70">Advanced speech-to-text with 95%+ accuracy across multiple languages</p>
              </CardContent>
            </Card>

            <Card className="glass-card smooth-transition scale-hover">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-accent to-primary rounded-lg flex items-center justify-center mx-auto mb-4 glow-green">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Smart Summarization</h3>
                <p className="text-white/70">Intelligent extraction of key points, decisions, and action items</p>
              </CardContent>
            </Card>

            <Card className="glass-card smooth-transition scale-hover">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-4 glow">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Multi-Language</h3>
                <p className="text-white/70">Automatic translation and processing of 50+ languages</p>
              </CardContent>
            </Card>

            <Card className="glass-card smooth-transition scale-hover">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-accent to-primary rounded-lg flex items-center justify-center mx-auto mb-4 glow-green">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Secure & Private</h3>
                <p className="text-white/70">Enterprise-grade security with encrypted data storage</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">How It Works</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Simple, fast, and intelligent meeting processing in just a few steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 glow">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Upload Recording</h3>
              <p className="text-white/70">Upload your meeting audio or video files from any platform</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center mx-auto mb-4 glow-green">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">AI Processing</h3>
              <p className="text-white/70">Our AI transcribes, translates, and analyzes your meeting content</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 glow">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Get Results</h3>
              <p className="text-white/70">Receive structured notes with summaries, action items, and insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="glass-card-light p-8">
            <CardContent className="p-0">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Transform Your Meetings?</h2>
              <p className="text-xl text-white/80 mb-8">
                Join thousands of professionals who trust TalkToText Pro for their meeting documentation
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="glass-button bg-primary/20 border-primary/30 hover:bg-primary/30 glow text-white"
                  >
                    Contact Sale
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}