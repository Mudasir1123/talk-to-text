import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import Image from 'next/image'
import Chatbot from '@/components/Chatbot'
import './globals.css'

export const metadata: Metadata = {
  title: 'TalkToText Pro - AI-Powered Meeting Transcriptions & Notes',
  description: 'Created with MSG-GenAlus',
  generator: 'TalkToText Pro',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Chatbot />
        <Analytics />
      </body>
    </html>
  )
}