import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'

const ECGChart = ({ data, apneaEvents, title = "ECG Signal" }) => {
  // Custom tooltip for ECG data
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-3 rounded-lg border shadow-lg">
          <p className="text-sm font-medium">{`Time: ${parseFloat(label).toFixed(3)}s`}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            {`ECG: ${payload[0].value.toFixed(4)}mV`}
          </p>
        </div>
      )
    }
    return null
  }

  // Find apnea events that overlap with the current time range
  const getApneaEventsInRange = () => {
    if (!apneaEvents || !data || data.length === 0) return []
    
    const minTime = Math.min(...data.map(d => d.time))
    const maxTime = Math.max(...data.map(d => d.time))
    
    return apneaEvents.filter(event => 
      (event.start_time >= minTime && event.start_time <= maxTime) ||
      (event.end_time >= minTime && event.end_time <= maxTime) ||
      (event.start_time <= minTime && event.end_time >= maxTime)
    )
  }

  const visibleApneaEvents = getApneaEventsInRange()

  return (
    <Card className="bg-white/30 dark:bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          {visibleApneaEvents.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {visibleApneaEvents.length} Apnea Event{visibleApneaEvents.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Real-time ECG signal with detected apnea events highlighted
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="time" 
                type="number"
                scale="linear"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => `${value.toFixed(1)}s`}
                className="text-xs"
              />
              <YAxis 
                tickFormatter={(value) => `${value.toFixed(2)}`}
                className="text-xs"
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Apnea event reference lines */}
              {visibleApneaEvents.map((event, index) => (
                <React.Fragment key={index}>
                  <ReferenceLine 
                    x={event.start_time} 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    label={{ value: "Apnea Start", position: "top" }}
                  />
                  <ReferenceLine 
                    x={event.end_time} 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    label={{ value: "Apnea End", position: "top" }}
                  />
                </React.Fragment>
              ))}
              
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 4, fill: "#3b82f6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Apnea Events Legend */}
        {visibleApneaEvents.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
              Detected Apnea Events
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {visibleApneaEvents.slice(0, 4).map((event, index) => (
                <div key={index} className="flex justify-between text-red-700 dark:text-red-300">
                  <span>Event {index + 1}:</span>
                  <span>{event.start_time.toFixed(1)}s - {event.end_time.toFixed(1)}s ({event.duration.toFixed(1)}s)</span>
                </div>
              ))}
              {visibleApneaEvents.length > 4 && (
                <div className="text-red-600 dark:text-red-400 text-center col-span-full">
                  ... and {visibleApneaEvents.length - 4} more events
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ECGChart

