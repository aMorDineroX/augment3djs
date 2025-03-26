'use client'

import Sidebar from '@/components/Sidebar'
import dynamic from 'next/dynamic'

// Use dynamic import with strict client-side rendering
const Scene = dynamic(
  () => import('@/components/Scene'),
  { 
    ssr: false,
    loading: () => <div className="flex-1 flex items-center justify-center">Loading 3D visualization...</div>
  }
)

export default function Home() {
  return (
    <main className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 relative">
        <Scene />
      </div>
    </main>
  )
}
