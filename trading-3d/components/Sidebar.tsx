'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun, HelpCircle, Settings } from 'lucide-react'

export default function Sidebar() {
  const [activeTimeframe, setActiveTimeframe] = useState('1H')
  const [indicators, setIndicators] = useState({
    MA: false,
    RSI: false,
    MACD: false
  })
  const [theme, setTheme] = useState('dark')
  const [showTooltip, setShowTooltip] = useState('')
  const [actionFeedback, setActionFeedback] = useState({ show: false, type: '', message: '' })
  
  // Handle theme toggle
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark')
    
    // Save preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
    }
  }
  
  // Load saved theme on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') || 'dark'
      setTheme(savedTheme)
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark')
      }
    }
  }, [])
  
  // Handle timeframe change
  const handleTimeframeChange = (timeframe: string) => {
    setActiveTimeframe(timeframe)
    
    // Show feedback
    showFeedback('success', `Timeframe changed to ${timeframe}`)
    
    // Only dispatch event if we're in the browser
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trading-timeframe-change', {
        detail: { timeframe }
      }))
    }
  }
  
  // Handle indicator toggle
  const handleIndicatorToggle = (indicator: string) => {
    const newState = !indicators[indicator]
    setIndicators(prev => ({
      ...prev,
      [indicator]: newState
    }))
    
    // Show feedback
    showFeedback('info', `${indicator} ${newState ? 'added' : 'removed'}`)
    
    // Only dispatch event if we're in the browser
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trading-indicator-toggle', {
        detail: { indicator, enabled: newState }
      }))
    }
  }
  
  // Handle trading action
  const handleTradingAction = (action: 'buy' | 'sell') => {
    // Show feedback
    showFeedback(
      action === 'buy' ? 'success' : 'danger', 
      `${action.toUpperCase()} order placed`
    )
    
    // Only dispatch event if we're in the browser
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trading-action', {
        detail: { action }
      }))
    }
  }
  
  // Show temporary feedback
  const showFeedback = (type: string, message: string) => {
    setActionFeedback({ show: true, type, message })
    
    // Hide after 2 seconds
    setTimeout(() => {
      setActionFeedback({ show: false, type: '', message: '' })
    }, 2000)
  }
  
  // Tooltips content
  const tooltips = {
    timeframe: "Select the time interval for each candle",
    indicators: "Technical indicators to enhance your analysis",
    trading: "Execute buy or sell orders",
    theme: "Toggle between dark and light mode"
  }
  
  return (
    <div className={`w-64 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'} p-4 h-screen transition-colors duration-300 relative`}>
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-opacity-20 hover:bg-gray-500 transition-all"
          onMouseEnter={() => setShowTooltip('theme')}
          onMouseLeave={() => setShowTooltip('')}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {showTooltip === 'theme' && (
          <div className="absolute right-0 mt-1 px-2 py-1 bg-gray-700 text-white text-xs rounded shadow-lg">
            {tooltips.theme}
          </div>
        )}
      </div>
      
      <h2 className="text-xl font-bold mb-6 flex items-center">
        Trading Controls
        <Settings className="ml-2" size={16} />
      </h2>
      
      {/* Action feedback */}
      {actionFeedback.show && (
        <div className={`mb-4 py-2 px-3 rounded text-sm text-center animate-fadeIn 
          ${actionFeedback.type === 'success' ? 'bg-green-600 text-white' : 
            actionFeedback.type === 'danger' ? 'bg-red-600 text-white' : 
            'bg-blue-600 text-white'}`}>
          {actionFeedback.message}
        </div>
      )}
      
      {/* Timeframe Section */}
      <div className="mb-6 relative">
        <h3 className="font-medium mb-2 flex items-center">
          Timeframe
          <button 
            className="ml-2"
            onMouseEnter={() => setShowTooltip('timeframe')}
            onMouseLeave={() => setShowTooltip('')}
          >
            <HelpCircle size={14} />
          </button>
        </h3>
        {showTooltip === 'timeframe' && (
          <div className="absolute left-0 mt-1 px-2 py-1 bg-gray-700 text-white text-xs rounded shadow-lg z-10">
            {tooltips.timeframe}
          </div>
        )}
        <div className="flex space-x-2">
          {['1H', '4H', '1D'].map(timeframe => (
            <button
              key={timeframe}
              className={`px-3 py-1 rounded transition-all duration-200 transform hover:scale-105 
                ${activeTimeframe === timeframe ? 
                  'bg-blue-600 text-white shadow-md' : 
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}
              onClick={() => handleTimeframeChange(timeframe)}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>
      
      {/* Indicators Section */}
      <div className="mb-6 relative">
        <h3 className="font-medium mb-2 flex items-center">
          Indicators
          <button 
            className="ml-2"
            onMouseEnter={() => setShowTooltip('indicators')}
            onMouseLeave={() => setShowTooltip('')}
          >
            <HelpCircle size={14} />
          </button>
        </h3>
        {showTooltip === 'indicators' && (
          <div className="absolute left-0 mt-1 px-2 py-1 bg-gray-700 text-white text-xs rounded shadow-lg z-10">
            {tooltips.indicators}
          </div>
        )}
        <div className="space-y-2">
          {Object.keys(indicators).map(indicator => (
            <button
              key={indicator}
              className={`px-3 py-1 rounded block w-full text-left transition-all duration-200 
                ${indicators[indicator] ? 
                  'bg-blue-600 text-white' : 
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}
              onClick={() => handleIndicatorToggle(indicator)}
            >
              <span className="flex items-center">
                <span className={`inline-block w-4 h-4 mr-2 rounded-full ${indicators[indicator] ? 'bg-green-400' : 'bg-gray-500'}`}></span>
                {indicators[indicator] ? 'Remove ' : 'Add '}{indicator}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Trading Section */}
      <div className="relative">
        <h3 className="font-medium mb-2 flex items-center">
          Trading
          <button 
            className="ml-2"
            onMouseEnter={() => setShowTooltip('trading')}
            onMouseLeave={() => setShowTooltip('')}
          >
            <HelpCircle size={14} />
          </button>
        </h3>
        {showTooltip === 'trading' && (
          <div className="absolute left-0 mt-1 px-2 py-1 bg-gray-700 text-white text-xs rounded shadow-lg z-10">
            {tooltips.trading}
          </div>
        )}
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 flex-1 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
            onClick={() => handleTradingAction('buy')}
          >
            Buy
          </button>
          <button
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 flex-1 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
            onClick={() => handleTradingAction('sell')}
          >
            Sell
          </button>
        </div>
      </div>
      
      {/* Version */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs opacity-50">
        Trading 3D v1.0.0
      </div>
    </div>
  )
}