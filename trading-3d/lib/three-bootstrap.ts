import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// Data for our trading chart
interface CandleData {
  open: number
  high: number
  low: number
  close: number
  timestamp: number
}

// Sample data for different timeframes
const timeframeData = {
  '1H': [
    { open: 100, high: 150, low: 90, close: 120, timestamp: 1635724800000 },
    { open: 120, high: 160, low: 110, close: 140, timestamp: 1635728400000 },
    { open: 140, high: 180, low: 130, close: 160, timestamp: 1635732000000 },
    { open: 160, high: 200, low: 150, close: 180, timestamp: 1635735600000 },
    { open: 180, high: 220, low: 170, close: 200, timestamp: 1635739200000 },
  ],
  '4H': [
    { open: 100, high: 170, low: 90, close: 150, timestamp: 1635724800000 },
    { open: 150, high: 200, low: 140, close: 170, timestamp: 1635739200000 },
    { open: 170, high: 220, low: 160, close: 190, timestamp: 1635753600000 },
  ],
  '1D': [
    { open: 100, high: 200, low: 90, close: 180, timestamp: 1635724800000 },
    { open: 180, high: 250, low: 170, close: 210, timestamp: 1635811200000 },
  ]
}

// Current state
const state = {
  timeframe: '1H',
  indicators: {
    MA: false,
    RSI: false,
    MACD: false
  },
  theme: 'dark'
}

// Initialize Three.js scene imperatively without React
export const initializeScene = (container: HTMLElement): (() => void) => {
  // Create renderer with better quality
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputEncoding = THREE.sRGBEncoding
  container.appendChild(renderer.domElement)
  
  // Create scene with better lighting
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x111827)
  
  // Fog for depth perception
  scene.fog = new THREE.Fog(0x111827, 15, 30)
  
  // Create camera with better positioning
  const camera = new THREE.PerspectiveCamera(
    60, 
    container.clientWidth / container.clientHeight, 
    0.1, 
    1000
  )
  camera.position.set(0, 0.5, 5)
  
  // Add lights with better setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)
  
  const pointLight = new THREE.PointLight(0xffffff, 0.8)
  pointLight.position.set(5, 5, 5)
  pointLight.castShadow = true
  pointLight.shadow.mapSize.width = 1024
  pointLight.shadow.mapSize.height = 1024
  scene.add(pointLight)
  
  // Add a directional light for better shadows
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5)
  dirLight.position.set(-5, 5, 5)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.width = 1024
  dirLight.shadow.mapSize.height = 1024
  scene.add(dirLight)
  
  // Add floor/grid for better spatial perception
  const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222)
  gridHelper.position.y = -1
  scene.add(gridHelper)
  
  // Add a reflective floor
  const floorGeometry = new THREE.PlaneGeometry(20, 20)
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x111827,
    metalness: 0.5,
    roughness: 0.3,
    envMapIntensity: 0.5
  })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -1
  floor.receiveShadow = true
  scene.add(floor)
  
  // Add controls with better damping
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxPolarAngle = Math.PI / 2
  controls.minDistance = 3
  controls.maxDistance = 10
  
  // Create trading chart
  const chartGroup = new THREE.Group()
  scene.add(chartGroup)
  
  // Function to update the chart
  const updateChart = () => {
    // Clear existing chart
    while(chartGroup.children.length > 0) {
      const child = chartGroup.children[0];
      if (child instanceof THREE.Mesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
      chartGroup.remove(child);
    }
    
    // Get current data based on timeframe
    const candleData = timeframeData[state.timeframe];
    
    // Create candles with better appearance
    candleData.forEach((candle, index) => {
      const height = Math.abs(candle.close - candle.open) * 0.01
      
      // Improved candle material with emissive properties
      const color = candle.close > candle.open ? 0x00ff88 : 0xff4466
      const candle3D = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, height, 0.15),
        new THREE.MeshStandardMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: 0.2,
          metalness: 0.7,
          roughness: 0.3
        })
      )
      candle3D.position.set(index * 0.5 - (candleData.length * 0.25), 0, 0)
      candle3D.castShadow = true
      candle3D.receiveShadow = true
      
      // Add animation effect
      const initialY = candle3D.position.y
      setTimeout(() => {
        // Animate candle appearing from below
        const startY = -1
        const duration = 500 // ms
        const startTime = Date.now()
        
        function animateCandle() {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)
          // Easing function for smoother animation
          const easedProgress = 1 - Math.pow(1 - progress, 3)
          
          candle3D.position.y = startY + (initialY - startY) * easedProgress
          
          if (progress < 1) {
            requestAnimationFrame(animateCandle)
          }
        }
        
        animateCandle()
      }, index * 100) // Stagger the animations
      
      chartGroup.add(candle3D)
      
      // Add wick with better appearance
      const wickHeight = Math.abs(candle.high - candle.low) * 0.01
      const wickMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, wickHeight, 0.02),
        new THREE.MeshStandardMaterial({ 
          color: 0xffffff,
          metalness: 0.5,
          roughness: 0.5
        })
      )
      wickMesh.position.set(index * 0.5 - (candleData.length * 0.25), 0, 0)
      wickMesh.castShadow = true
      chartGroup.add(wickMesh)
    })
    
    // Add indicators with enhanced visuals
    if (state.indicators.MA) {
      addMovingAverage(candleData);
    }
    
    if (state.indicators.RSI) {
      addRSI(candleData);
    }
    
    if (state.indicators.MACD) {
      addMACD(candleData);
    }
    
    // Add title with better visual
    const labelGeometry = new THREE.BoxGeometry(1.5, 0.3, 0.05)
    const labelMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3377ff,
      metalness: 0.7,
      roughness: 0.2,
      emissive: 0x3377ff,
      emissiveIntensity: 0.3
    })
    const label = new THREE.Mesh(labelGeometry, labelMaterial)
    label.position.set(0, 1.5, 0)
    label.castShadow = true
    chartGroup.add(label)
    
    // Add timeframe indicator
    const timeframeIndicator = createTimeframeIndicator(state.timeframe)
    timeframeIndicator.position.set(0, 1.2, 0)
    chartGroup.add(timeframeIndicator)
  }
  
  // Helper function to create a visual indicator for the timeframe
  const createTimeframeIndicator = (timeframe: string): THREE.Group => {
    const group = new THREE.Group()
    
    // Different shape/color based on timeframe
    const color = timeframe === '1H' ? 0x00ffff : 
                 timeframe === '4H' ? 0xffff00 : 0xff00ff
    
    // Number of small indicator boxes
    const count = timeframe === '1H' ? 1 : 
                 timeframe === '4H' ? 4 : 24
                 
    // Create multiple small boxes with better materials
    for (let i = 0; i < count; i++) {
      const boxSize = 0.06
      const spacing = count <= 4 ? 0.12 : 0.04
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(boxSize, boxSize, boxSize),
        new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.7,
          metalness: 0.8,
          roughness: 0.2
        })
      )
      
      // Position in a line or circle depending on count
      if (count <= 4) {
        // Line for few boxes
        box.position.set((i - (count - 1) / 2) * spacing, 0, 0)
      } else {
        // Circle for many boxes
        const angle = (i / count) * Math.PI * 2
        const radius = 0.25
        box.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0
        )
      }
      
      // Add subtle animation
      const originalY = box.position.y
      const pulseSpeed = 1.5 + Math.random() * 0.5
      const pulseHeight = 0.02 + Math.random() * 0.02
      const startTime = Date.now() + i * 100
      
      function animateBox() {
        const time = Date.now() - startTime
        box.position.y = originalY + Math.sin(time * 0.002 * pulseSpeed) * pulseHeight
        
        requestAnimationFrame(animateBox)
      }
      
      animateBox()
      
      box.castShadow = true
      group.add(box)
    }
    
    return group
  }
  
  // Helper functions for indicators with improved visuals
  const addMovingAverage = (data) => {
    // Create curve for smoother line
    const points = data.map((candle, i) => 
      new THREE.Vector3(i * 0.5 - (data.length * 0.25), candle.close * 0.01 + 0.2, 0)
    )
    
    const curve = new THREE.CatmullRomCurve3(points)
    const curvePoints = curve.getPoints(50)
    
    const maLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curvePoints),
      new THREE.LineBasicMaterial({ 
        color: 0x00ffff,
        linewidth: 2
      })
    )
    chartGroup.add(maLine)
    
    // Add glow effect with particles along the line
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 15
    const particlesPositions = []
    const particleSize = 0.03
    
    for (let i = 0; i < particlesCount; i++) {
      const t = i / (particlesCount - 1)
      const point = curve.getPoint(t)
      particlesPositions.push(point.x, point.y, point.z)
    }
    
    particlesGeometry.setAttribute('position', 
      new THREE.Float32BufferAttribute(particlesPositions, 3)
    )
    
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: particleSize,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    })
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    chartGroup.add(particles)
  }
  
  const addRSI = (data) => {
    // Similar enhancement to RSI visualization
    const points = data.map((candle, i) => 
      new THREE.Vector3(i * 0.5 - (data.length * 0.25), candle.close * 0.008 - 0.3, 0)
    )
    
    const curve = new THREE.CatmullRomCurve3(points)
    const curvePoints = curve.getPoints(50)
    
    const rsiLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curvePoints),
      new THREE.LineBasicMaterial({ 
        color: 0xff00ff,
        linewidth: 2 
      })
    )
    chartGroup.add(rsiLine)
  }
  
  const addMACD = (data) => {
    // Similar enhancement to MACD visualization
    const points = data.map((candle, i) => 
      new THREE.Vector3(i * 0.5 - (data.length * 0.25), candle.close * 0.006 - 0.5, 0)
    )
    
    const curve = new THREE.CatmullRomCurve3(points)
    const curvePoints = curve.getPoints(50)
    
    const macdLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curvePoints),
      new THREE.LineBasicMaterial({ 
        color: 0xffff00,
        linewidth: 2 
      })
    )
    chartGroup.add(macdLine)
  }
  
  // Initial chart update
  updateChart()
  
  // Handle window resize
  const handleResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  }
  
  window.addEventListener('resize', handleResize)
  
  // Animation loop with improved performance
  let animationFrameId: number
  let previousTime = 0
  
  const animate = (time = 0) => {
    animationFrameId = requestAnimationFrame(animate)
    
    // Calculate delta time for smoother animations
    const deltaTime = (time - previousTime) * 0.001
    previousTime = time
    
    // Rotate chart slightly with smooth motion
    chartGroup.rotation.y += deltaTime * 0.1
    
    // Update controls
    controls.update()
    
    // Render
    renderer.render(scene, camera)
  }
  
  // Start animation
  animate()
  
  // Event handlers
  const timeframeChangeHandler = ((event: CustomEvent) => {
    state.timeframe = event.detail.timeframe;
    updateChart();
  }) as EventListener;
  
  const indicatorToggleHandler = ((event: CustomEvent) => {
    const { indicator, enabled } = event.detail;
    state.indicators[indicator] = enabled;
    updateChart();
  }) as EventListener;
  
  const tradingActionHandler = ((event: CustomEvent) => {
    const { action } = event.detail;
    // Enhanced buy/sell animation
    const actionColor = action === 'buy' ? 0x00ff44 : 0xff4400;
    
    // Create a flash effect with better particles
    const particlesCount = 100
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesPositions = new Float32Array(particlesCount * 3)
    const particlesSizes = new Float32Array(particlesCount)
    
    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3
      particlesPositions[i3] = (Math.random() - 0.5) * 2
      particlesPositions[i3 + 1] = (Math.random() - 0.5) * 2
      particlesPositions[i3 + 2] = (Math.random() - 0.5) * 2
      
      particlesSizes[i] = Math.random() * 0.1 + 0.05
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3))
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(particlesSizes, 1))
    
    const particlesMaterial = new THREE.PointsMaterial({
      color: actionColor,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    })
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    particles.position.set(0, 0, 0)
    scene.add(particles)
    
    // Animate particles
    const startTime = Date.now()
    const duration = 1500
    
    function animateParticles() {
      const elapsedTime = Date.now() - startTime
      const progress = elapsedTime / duration
      
      if (progress >= 1) {
        scene.remove(particles)
        particlesGeometry.dispose()
        particlesMaterial.dispose()
        return
      }
      
      particles.rotation.y += 0.01
      particlesMaterial.opacity = 1 - progress
      
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3
        const x = particlesPositions[i3]
        const y = particlesPositions[i3 + 1]
        const z = particlesPositions[i3 + 2]
        
        particlesPositions[i3] = x + (x * progress * 0.1)
        particlesPositions[i3 + 1] = y + (y * progress * 0.1)
        particlesPositions[i3 + 2] = z + (z * progress * 0.1)
      }
      
      particlesGeometry.attributes.position.needsUpdate = true
      
      requestAnimationFrame(animateParticles)
    }
    
    animateParticles()
  }) as EventListener;
  
  // Theme change handler
  const themeChangeHandler = ((event: CustomEvent) => {
    state.theme = event.detail.theme;
    
    // Update scene appearance based on theme
    if (state.theme === 'dark') {
      scene.background = new THREE.Color(0x111827);
      scene.fog = new THREE.Fog(0x111827, 15, 30);
      floor.material.color.set(0x111827);
    } else {
      scene.background = new THREE.Color(0xf0f4f8);
      scene.fog = new THREE.Fog(0xf0f4f8, 15, 30);
      floor.material.color.set(0xf0f4f8);
    }
  }) as EventListener;
  
  window.addEventListener('trading-timeframe-change', timeframeChangeHandler);
  window.addEventListener('trading-indicator-toggle', indicatorToggleHandler);
  window.addEventListener('trading-action', tradingActionHandler);
  window.addEventListener('trading-theme-change', themeChangeHandler);
  
  // Hide loading message
  const loadingElement = container.querySelector('div');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
  
  // Return cleanup function
  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('trading-timeframe-change', timeframeChangeHandler);
    window.removeEventListener('trading-indicator-toggle', indicatorToggleHandler);
    window.removeEventListener('trading-action', tradingActionHandler);
    window.removeEventListener('trading-theme-change', themeChangeHandler);
    
    cancelAnimationFrame(animationFrameId);
    renderer.dispose();
    container.removeChild(renderer.domElement);
    
    // Dispose geometries and materials
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (object.material instanceof THREE.Material) {
          object.material.dispose();
        } else if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        }
      }
    });
  };
};
