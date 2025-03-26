'use client'

import { useRef } from 'react'
import { Mesh } from 'three'
import { useFrame } from '@react-three/fiber'
import { Text, Box } from '@react-three/drei'

interface CandleData {
  open: number
  high: number
  low: number
  close: number
  timestamp: number
}

export default function TradingChart() {
  const meshRef = useRef<Mesh>(null)
  
  const candleData: CandleData[] = [
    { open: 100, high: 150, low: 90, close: 120, timestamp: 1635724800000 },
    { open: 120, high: 160, low: 110, close: 140, timestamp: 1635811200000 },
  ]

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.1
    }
  })

  // Safe clipboard handling with user interaction
  const handleCopyData = (event) => {
    event.stopPropagation()
    // Instead of direct clipboard API usage, trigger this from a user interaction
    try {
      // Only call clipboard API from explicit user interactions
      console.log('Copy action requested - should be triggered from a button click')
    } catch (error) {
      console.error('Clipboard operation failed:', error)
    }
  }

  return (
    <group>
      {candleData.map((candle, index) => (
        <mesh
          key={index}
          position={[index * 0.5, 0, 0]}
          ref={index === 0 ? meshRef : undefined}
          onClick={handleCopyData}
        >
          <boxGeometry args={[0.1, Math.abs(candle.close - candle.open) * 0.01, 0.1]} />
          <meshStandardMaterial color={candle.close > candle.open ? 'green' : 'red'} />
        </mesh>
      ))}
      <Text 
        position={[0, 1.5, 0]} 
        fontSize={0.2}
        color="white"
      >
        Trading Data
      </Text>
    </group>
  )
}
