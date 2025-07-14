import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'

const ProbabilityChart = ({ data, threshold = 0.5, title = "Apnea Probability" }) => {
  // Custom tooltip for probability data
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const probability = payload[0].value
      const percentage = (probability * 100).toFixed(1)
      const risk = probability > threshold ? 'High Risk' : 'Low Risk'
      const riskColor = probability > threshold ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
      
      return (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-3 rounded-lg border shadow-lg">
          <p className="text-sm font-medium">{`Time: ${parseFloat(label).toFixed(1)}s`}</p>
          <p className="text-sm text-purple-600 dark:text-purple-400">
            {`Probability: ${percentage}%`}
          </p>
          <p className={`text-sm font-medium ${riskColor}`}>
            {risk}
          </p>
        </div>
      )
    }
    return null
  }

  // Calculate statistics
  const avgProbability = data ? (data.reduce((sum, d) => sum + d.probability, 0) / data.length) : 0
  const maxProbability = data ? Math.max(...data.map(d => d.probability)) : 0
  const highRiskPeriods = data ? data.filter(d => d.probability > threshold).length : 0
  const highRiskPercentage = data ? (highRiskPeriods / data.length * 100) : 0

  return (
    <Card className="bg-white/30 dark:bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <div className="flex space-x-2">
            <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
              Avg: {(avgProbability * 100).toFixed(1)}%
            </Badge>
            <Badge variant="outline" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
              Max: {(maxProbability * 100).toFixed(1)}%
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>
          Probability of sleep apnea occurrence over time (threshold: {(threshold * 100)}%)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="probabilityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="highRiskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="time" 
                type="number"
                scale="linear"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => `${value.toFixed(0)}s`}
                className="text-xs"
              />
              <YAxis 
                domain={[0, 1]}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                className="text-xs"
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Threshold reference line */}
              <ReferenceLine 
                y={threshold} 
                stroke="#ef4444" 
                strokeWidth={2}
                strokeDasharray="8 4"
                label={{ value: `Threshold (${(threshold * 100)}%)`, position: "right" }}
              />
              
              {/* Low risk area */}
              <Area 
                type="monotone" 
                dataKey="probability" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                fill="url(#probabilityGradient)"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Statistics Summary */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">Average Risk</div>
            <div className="text-lg font-bold text-purple-800 dark:text-purple-200">
              {(avgProbability * 100).toFixed(1)}%
            </div>
          </div>
          
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-xs text-red-600 dark:text-red-400 font-medium">Peak Risk</div>
            <div className="text-lg font-bold text-red-800 dark:text-red-200">
              {(maxProbability * 100).toFixed(1)}%
            </div>
          </div>
          
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">High Risk Time</div>
            <div className="text-lg font-bold text-orange-800 dark:text-orange-200">
              {highRiskPercentage.toFixed(1)}%
            </div>
          </div>
          
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Data Points</div>
            <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
              {data ? data.length : 0}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProbabilityChart

