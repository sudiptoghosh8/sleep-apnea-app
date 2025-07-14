import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Upload, Activity, Heart, TrendingUp, Settings, Moon, Sun } from 'lucide-react'
import ECGChart from './components/ECGChart.jsx'
import ProbabilityChart from './components/ProbabilityChart.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import './App.css'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [ecgData, setEcgData] = useState(null)
  const [error, setError] = useState(null)
  const [sensitivity, setSensitivity] = useState(0.5)
  const [showSettings, setShowSettings] = useState(false)
  const fileInputRef = useRef(null)

  // Settings state
  const [settings, setSettings] = useState({
    enableAnimations: true,
    showTooltips: true,
    showGridLines: true,
    chartStyle: 'smooth',
    chartHeight: 320,
    sensitivity: 0.5,
    probabilityThreshold: 0.5,
    autoAnalysis: true,
    showApneaEvents: true,
    realTimeProcessing: false,
    colorTheme: 'Default Blue',
    ecgLineColor: '#3b82f6',
    probabilityFillColor: '#8b5cf6',
    alertColor: '#ef4444'
  })

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings)
    // Update sensitivity if changed
    if (newSettings.sensitivity !== sensitivity) {
      setSensitivity(newSettings.sensitivity)
    }
  }

  const handleSaveConfig = () => {
    const config = {
      ...settings,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sleep-apnea-config-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleLoadConfig = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const config = JSON.parse(e.target.result)
            setSettings(config)
            setSensitivity(config.sensitivity || 0.5)
          } catch (error) {
            setError('Invalid configuration file')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleFileUpload = async (file) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['csv', 'txt', 'json', 'apn']
    const fileExtension = file.name.split('.').pop().toLowerCase()
    
    if (!allowedTypes.includes(fileExtension)) {
      setError('Please upload a valid ECG file (CSV, TXT, JSON, or APN)')
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('sensitivity', sensitivity.toString())

      const response = await fetch('http://localhost:5002/api/ecg/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      setAnalysisResult(result.analysis)
      setEcgData(result.ecg_data)

      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0)
        setIsUploading(false)
      }, 1000)

    } catch (err) {
      setError(err.message)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'normal': return 'bg-green-500'
      case 'mild': return 'bg-yellow-500'
      case 'moderate': return 'bg-orange-500'
      case 'severe': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getSeverityTextColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'normal': return 'text-green-600 dark:text-green-400'
      case 'mild': return 'text-yellow-600 dark:text-yellow-400'
      case 'moderate': return 'text-orange-600 dark:text-orange-400'
      case 'severe': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'dark' : ''}`}>
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900" />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 dark:bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 dark:bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Sleep Apnea Detection
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Advanced ECG Analysis & Visualization
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="bg-white/20 dark:bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/30 dark:hover:bg-white/20"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="bg-white/20 dark:bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/30 dark:hover:bg-white/20"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="mb-8 bg-white/30 dark:bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Upload ECG Signal</span>
            </CardTitle>
            <CardDescription>
              Upload your ECG data file (CSV, TXT, JSON, or APN format, max 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.json,.apn"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                className="hidden"
              />
              
              {isUploading ? (
                <div className="space-y-4">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
                  <p className="text-gray-600 dark:text-gray-300">Processing ECG data...</p>
                  <Progress value={uploadProgress} className="w-full max-w-md mx-auto" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      Drop your ECG file here or click to browse
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Supported formats: CSV, TXT, JSON, APN (max 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sensitivity Control */}
            <div className="mt-6 space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Detection Sensitivity: {Math.round(sensitivity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={sensitivity}
                onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {analysisResult && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/30 dark:bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Apnea Events
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {analysisResult.apnea_count}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                      <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/30 dark:bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        AHI Score
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {analysisResult.ahi}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                      <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/30 dark:bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Severity
                      </p>
                      <Badge 
                        className={`${getSeverityColor(analysisResult.severity)} text-white text-lg px-3 py-1 mt-2`}
                      >
                        {analysisResult.severity}
                      </Badge>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                      <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Results */}
            <Card className="bg-white/30 dark:bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle>Analysis Details</CardTitle>
                <CardDescription>
                  Comprehensive sleep apnea analysis results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                        Sleep Study Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                          <span className="font-medium">{analysisResult.duration_hours}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Events:</span>
                          <span className="font-medium">{analysisResult.apnea_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">AHI:</span>
                          <span className="font-medium">{analysisResult.ahi} events/hour</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Severity:</span>
                          <span className={`font-medium ${getSeverityTextColor(analysisResult.severity)}`}>
                            {analysisResult.severity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                        Signal Statistics
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Data Points:</span>
                          <span className="font-medium">{analysisResult.signal_stats?.length?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Mean Value:</span>
                          <span className="font-medium">{analysisResult.signal_stats?.mean?.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Std Deviation:</span>
                          <span className="font-medium">{analysisResult.signal_stats?.std?.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Range:</span>
                          <span className="font-medium">
                            {analysisResult.signal_stats?.min?.toFixed(2)} to {analysisResult.signal_stats?.max?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Visualization */}
            <Card className="bg-white/30 dark:bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle>ECG Visualization</CardTitle>
                <CardDescription>
                  Interactive ECG signal analysis with dual-mode visualization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="ecg" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="ecg" className="flex items-center space-x-2">
                      <Activity className="w-4 h-4" />
                      <span>ECG Signal</span>
                    </TabsTrigger>
                    <TabsTrigger value="probability" className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Apnea Probability</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="ecg" className="space-y-4">
                    <ECGChart 
                      data={ecgData} 
                      apneaEvents={analysisResult.apnea_events}
                      title="ECG Signal Analysis"
                    />
                  </TabsContent>
                  
                  <TabsContent value="probability" className="space-y-4">
                    <ProbabilityChart 
                      data={analysisResult.probability_data}
                      threshold={0.5}
                      title="Sleep Apnea Probability Over Time"
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onSaveConfig={handleSaveConfig}
        onLoadConfig={handleLoadConfig}
      />
    </div>
  )
}

export default App

