import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import { Settings, Palette, Save, Download, Upload } from 'lucide-react'

const SettingsPanel = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsChange,
  onSaveConfig,
  onLoadConfig 
}) => {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleSettingChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)
    onSettingsChange(newSettings)
  }

  const colorThemes = [
    { name: 'Default Blue', primary: '#3b82f6', secondary: '#8b5cf6', accent: '#10b981' },
    { name: 'Medical Green', primary: '#059669', secondary: '#0891b2', accent: '#dc2626' },
    { name: 'Professional Purple', primary: '#7c3aed', secondary: '#db2777', accent: '#f59e0b' },
    { name: 'Clinical Red', primary: '#dc2626', secondary: '#ea580c', accent: '#2563eb' },
    { name: 'Ocean Teal', primary: '#0891b2', secondary: '#0d9488', accent: '#7c2d12' }
  ]

  const chartStyles = [
    { name: 'Smooth Lines', value: 'smooth' },
    { name: 'Sharp Lines', value: 'linear' },
    { name: 'Stepped', value: 'step' }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-white/20 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Application Settings</span>
            </CardTitle>
            <CardDescription>
              Customize your ECG analysis experience
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="display" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="display">Display</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>
            
            {/* Display Settings */}
            <TabsContent value="display" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Display Preferences</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="animations">Enable Animations</Label>
                      <Switch
                        id="animations"
                        checked={localSettings.enableAnimations}
                        onCheckedChange={(checked) => handleSettingChange('enableAnimations', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="tooltips">Show Tooltips</Label>
                      <Switch
                        id="tooltips"
                        checked={localSettings.showTooltips}
                        onCheckedChange={(checked) => handleSettingChange('showTooltips', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="grid">Show Grid Lines</Label>
                      <Switch
                        id="grid"
                        checked={localSettings.showGridLines}
                        onCheckedChange={(checked) => handleSettingChange('showGridLines', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Chart Style</Label>
                      <Select
                        value={localSettings.chartStyle}
                        onValueChange={(value) => handleSettingChange('chartStyle', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {chartStyles.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
                              {style.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Chart Height</Label>
                      <Slider
                        value={[localSettings.chartHeight]}
                        onValueChange={(value) => handleSettingChange('chartHeight', value[0])}
                        min={200}
                        max={600}
                        step={50}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-500 text-center">
                        {localSettings.chartHeight}px
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Analysis Settings */}
            <TabsContent value="analysis" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Analysis Parameters</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Detection Sensitivity</Label>
                      <Slider
                        value={[localSettings.sensitivity * 100]}
                        onValueChange={(value) => handleSettingChange('sensitivity', value[0] / 100)}
                        min={0}
                        max={100}
                        step={10}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-500 text-center">
                        {Math.round(localSettings.sensitivity * 100)}%
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Probability Threshold</Label>
                      <Slider
                        value={[localSettings.probabilityThreshold * 100]}
                        onValueChange={(value) => handleSettingChange('probabilityThreshold', value[0] / 100)}
                        min={10}
                        max={90}
                        step={5}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-500 text-center">
                        {Math.round(localSettings.probabilityThreshold * 100)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoAnalysis">Auto-analyze on Upload</Label>
                      <Switch
                        id="autoAnalysis"
                        checked={localSettings.autoAnalysis}
                        onCheckedChange={(checked) => handleSettingChange('autoAnalysis', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showEvents">Highlight Apnea Events</Label>
                      <Switch
                        id="showEvents"
                        checked={localSettings.showApneaEvents}
                        onCheckedChange={(checked) => handleSettingChange('showApneaEvents', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="realTime">Real-time Processing</Label>
                      <Switch
                        id="realTime"
                        checked={localSettings.realTimeProcessing}
                        onCheckedChange={(checked) => handleSettingChange('realTimeProcessing', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Color Settings */}
            <TabsContent value="colors" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Color Themes</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {colorThemes.map((theme, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        localSettings.colorTheme === theme.name
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => handleSettingChange('colorTheme', theme.name)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{theme.name}</span>
                        {localSettings.colorTheme === theme.name && (
                          <Badge variant="default" className="text-xs">Active</Badge>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: theme.primary }}
                        />
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: theme.secondary }}
                        />
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: theme.accent }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-2">Custom Colors</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">ECG Line Color</Label>
                      <input
                        type="color"
                        value={localSettings.ecgLineColor}
                        onChange={(e) => handleSettingChange('ecgLineColor', e.target.value)}
                        className="w-full h-8 rounded border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Probability Fill</Label>
                      <input
                        type="color"
                        value={localSettings.probabilityFillColor}
                        onChange={(e) => handleSettingChange('probabilityFillColor', e.target.value)}
                        className="w-full h-8 rounded border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Alert Color</Label>
                      <input
                        type="color"
                        value={localSettings.alertColor}
                        onChange={(e) => handleSettingChange('alertColor', e.target.value)}
                        className="w-full h-8 rounded border"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Export Settings */}
            <TabsContent value="export" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configuration Management</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <h4 className="font-medium mb-3 flex items-center">
                      <Save className="w-4 h-4 mr-2" />
                      Save Configuration
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Save your current settings as a configuration file
                    </p>
                    <Button onClick={onSaveConfig} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Config
                    </Button>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-medium mb-3 flex items-center">
                      <Upload className="w-4 h-4 mr-2" />
                      Load Configuration
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Load settings from a previously saved configuration file
                    </p>
                    <Button onClick={onLoadConfig} variant="outline" className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Load Config
                    </Button>
                  </Card>
                </div>
                
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    Current Configuration
                  </h4>
                  <pre className="text-xs text-yellow-700 dark:text-yellow-300 overflow-x-auto">
                    {JSON.stringify(localSettings, null, 2)}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsPanel

