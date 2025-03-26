import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trading 3D App',
  description: 'Application de trading avec visualisation 3D',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
