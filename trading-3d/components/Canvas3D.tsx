'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Create a separate wrapper around Three.js to isolate rendering
const ThreeCanvas = dynamic(
  () => import('./SceneWrapper'),
  { ssr: false, loading: () => null }
)

export default function Canvas3D() {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])
  
  // Return null during SSR or before mount
  if (!isMounted) return null
  
  // Use the wrapper component after mounting
  return <ThreeCanvas />
}