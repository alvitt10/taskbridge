import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TaskBridge — Find Trusted Local Services',
  description: 'AI-powered platform to find, book and pay verified local service professionals.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
