'use client'
import { useEffect, useRef, useState } from 'react'
import { Loader2, ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2 } from 'lucide-react'

// This component acts as a container for the canvas that will render Three.js content
export default function SceneWrapper() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(false)
  
  // Control fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }
  
  // Track fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Dispatch zoom events to the scene
  const handleZoom = (direction: 'in' | 'out') => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trading-camera-zoom', {
        detail: { direction }
      }));
    }
  }
  
  // Dispatch reset view event
  const handleResetView = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trading-camera-reset', {}));
    }
  }
  
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined' || !containerRef.current) return
    
    // Dynamically import the Three.js bootstrap function
    const initializeThreeJS = async () => {
      try {
        setIsLoading(true)
        // Import the bootstrap function
        const { initializeScene } = await import('../lib/three-bootstrap')
        // Initialize the Three.js scene inside our container
        const cleanup = initializeScene(containerRef.current)
        setIsLoading(false)
        // Return cleanup function
        return cleanup
      } catch (error) {
        console.error('Failed to initialize Three.js scene:', error)
        setIsLoading(false)
      }
    }
    
    // Initialize and store cleanup function
    let cleanupFunction: (() => void) | undefined
    initializeThreeJS().then(cleanup => {
      cleanupFunction = cleanup
    })
    
    // Show controls when mouse moves
    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(controlsTimeout)
      controlsTimeout = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
    
    let controlsTimeout: NodeJS.Timeout
    containerRef.current.addEventListener('mousemove', handleMouseMove)
    
    // Cleanup when component unmounts
    return () => {
      if (cleanupFunction) cleanupFunction()
      containerRef.current?.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(controlsTimeout)
    }
  }, [])
  
  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '100%' }}
      className="relative bg-black"
    >
      {isLoading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gray-900">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p>Initializing 3D Trading View...</p>
        </div>
      ) : (
        <>
          {/* Overlay controls that fade in/out with mouse movement */}
          <div 
            className={`absolute bottom-4 right-4 flex space-x-2 transition-opacity duration-300 ${
              showControls ? 'opacity-80' : 'opacity-0'
            }`}
          >
            <button 
              onClick={() => handleZoom('in')}
              className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700"
              aria-label="Zoom in"
              title="Zoom in"
            >
              <ZoomIn size={18} />
            </button>
            <button 
              onClick={() => handleZoom('out')}
              className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700"
              aria-label="Zoom out"
              title="Zoom out"
            >
              <ZoomOut size={18} />
            </button>
            <button 
              onClick={handleResetView}
              className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700"
              aria-label="Reset view"
              title="Reset view"
            >
              <RotateCw size={18} />
            </button>
            <button 
              onClick={toggleFullscreen}
              className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
          
          {/* Instruction overlay that fades away */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="bg-black bg-opacity-70 text-white px-6 py-3 rounded-lg animate-fadeOut">
              Drag to rotate • Scroll to zoom • Right-click to pan
            </div>
          </div>
        </>
      )}
    </div>
  )
}