'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type AssessmentResponse = {
  id: string
  score: number | null
  createdAt: Date
  assessment: {
    type: string
    title: string
  }
}

export function AssessmentProgressChart({
  responses,
}: {
  responses: AssessmentResponse[]
}) {
  // Group responses by assessment type
  const phq9Data = responses
    .filter((r) => r.assessment?.type === 'PHQ9')
    .map((r) => ({
      date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: r.score ?? 0,
    }))

  const gad7Data = responses
    .filter((r) => r.assessment?.type === 'GAD7')
    .map((r) => ({
      date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: r.score ?? 0,
    }))

  // Combine data by date
  const allDates = [...new Set([...phq9Data.map((d) => d.date), ...gad7Data.map((d) => d.date)])]
  const chartData = allDates.map((date) => {
    const phq9 = phq9Data.find((d) => d.date === date)
    const gad7 = gad7Data.find((d) => d.date === date)
    return {
      date,
      'Depression (PHQ-9)': phq9?.score,
      'Anxiety (GAD-7)': gad7?.score,
    }
  })

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No data available yet. Take some assessments to see your progress.</p>
      </div>
    )
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickLine={false}
            label={{ value: 'Date', position: 'insideBottom', offset: -5, style: { fontSize: 11 } }}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            label={{ value: 'Score', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
            domain={[0, 27]}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: '8px', border: '1px solid #e5e7eb' }}
          />
          <Legend
            verticalAlign="top"
            wrapperStyle={{ fontSize: 11 }}
          />
          <Line
            type="monotone"
            dataKey="Depression (PHQ-9)"
            stroke="#FF9149"
            strokeWidth={2}
            dot={{ fill: '#FF9149', r: 4 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="Anxiety (GAD-7)"
            stroke="#60B5FF"
            strokeWidth={2}
            dot={{ fill: '#60B5FF', r: 4 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
