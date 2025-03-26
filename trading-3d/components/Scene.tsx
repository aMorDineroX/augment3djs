'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the wrapper without using React Three Fiber directly
const SceneWrapper = dynamic(
  () => import('./SceneWrapper'),
  { ssr: false }
)

export default function Scene() {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Only render the wrapper on the client
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      {isClient ? (
        <SceneWrapper />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          Initializing 3D viewer...
        </div>
      )}
    </div>
  )
}
