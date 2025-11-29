'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, TrendingUp, TrendingDown, Minus, Brain, Heart, Users, Calendar, BookOpen } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface AnalyticsData {
  overview: {
    journalEntries: number
    aiSessions: number
    groupSessions: number
    therapyBookings: number
    totalEngagement: number
  }
  assessmentHistory: Array<{
    id: string
    score: number
    severity: string
    createdAt: string
    assessment: {
      type: string
      title: string
    }
  }>
  journalMoodHistory: Array<{
    mood: string
    createdAt: string
  }>
  activityLast30Days: number
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    )
  }

  if (!data) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">Unable to load analytics data</p>
      </Card>
    )
  }

  // Process assessment data for charts
  const phq9Data = data.assessmentHistory
    .filter(a => a.assessment.type === 'PHQ9')
    .map(a => ({
      date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: a.score,
      severity: a.severity,
    }))

  const gad7Data = data.assessmentHistory
    .filter(a => a.assessment.type === 'GAD7')
    .map(a => ({
      date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: a.score,
      severity: a.severity,
    }))

  // Process mood data
  const moodMapping: { [key: string]: number } = {
    great: 5,
    good: 4,
    okay: 3,
    low: 2,
    struggling: 1,
  }

  const moodData = data.journalMoodHistory
    .filter(j => j.mood)
    .map(j => ({
      date: new Date(j.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: moodMapping[j.mood] || 3,
      moodLabel: j.mood,
    }))
    .reverse()
    .slice(0, 15)

  // Calculate trends
  const latestPHQ9 = phq9Data[phq9Data.length - 1]
  const previousPHQ9 = phq9Data[phq9Data.length - 2]
  const phq9Trend = latestPHQ9 && previousPHQ9 ? latestPHQ9.score - previousPHQ9.score : 0

  const latestGAD7 = gad7Data[gad7Data.length - 1]
  const previousGAD7 = gad7Data[gad7Data.length - 2]
  const gad7Trend = latestGAD7 && previousGAD7 ? latestGAD7.score - previousGAD7.score : 0

  const getTrendIcon = (trend: number) => {
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-green-500" />
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const getTrendText = (trend: number, isSymptomScore: boolean = true) => {
    if (trend === 0) return 'No change'
    const direction = trend > 0 ? 'Increased' : 'Decreased'
    const sentiment = isSymptomScore 
      ? (trend < 0 ? 'Improving' : 'Worsening')
      : (trend > 0 ? 'Improving' : 'Declining')
    return `${direction} (${sentiment})`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-darkTeal mb-2">Mental Health Analytics</h1>
        <p className="text-gray-600">
          Track your progress and gain insights into your mental health journey
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="h-8 w-8 text-teal opacity-70" />
            <Badge variant="secondary">{data.overview.journalEntries}</Badge>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Journal Entries</h3>
          <p className="text-xs text-gray-500 mt-1">Total written</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Brain className="h-8 w-8 text-purple-500 opacity-70" />
            <Badge variant="secondary">{data.overview.aiSessions}</Badge>
          </div>
          <h3 className="text-sm font-medium text-gray-600">AI Sessions</h3>
          <p className="text-xs text-gray-500 mt-1">Support chats</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-8 w-8 text-blue-500 opacity-70" />
            <Badge variant="secondary">{data.overview.groupSessions}</Badge>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Group Sessions</h3>
          <p className="text-xs text-gray-500 mt-1">Participated in</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-8 w-8 text-green-500 opacity-70" />
            <Badge variant="secondary">{data.overview.therapyBookings}</Badge>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Therapy Sessions</h3>
          <p className="text-xs text-gray-500 mt-1">Booked total</p>
        </Card>
      </div>

      {/* Engagement Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-darkTeal">Engagement Score</h2>
            <p className="text-sm text-gray-600 mt-1">Your overall platform activity</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-teal">{data.overview.totalEngagement}</div>
            <p className="text-xs text-gray-500 mt-1">points</p>
          </div>
        </div>
        <div className="bg-lightTeal/20 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-teal h-full transition-all duration-500"
            style={{ width: `${Math.min((data.overview.totalEngagement / 500) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Keep engaging with the platform to improve your mental health journey!
        </p>
      </Card>

      {/* Assessment Trends */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* PHQ-9 (Depression) */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-darkTeal">Depression Screening (PHQ-9)</h2>
            {phq9Trend !== 0 && (
              <div className="flex items-center gap-1 text-sm">
                {getTrendIcon(phq9Trend)}
                <span className={phq9Trend < 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(phq9Trend)} pts
                </span>
              </div>
            )}
          </div>
          {phq9Data.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={phq9Data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                  <YAxis domain={[0, 27]} style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#14B8A6" strokeWidth={2} dot={{ fill: '#14B8A6' }} />
                </LineChart>
              </ResponsiveContainer>
              {latestPHQ9 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Latest Score:</strong> {latestPHQ9.score}/27 - {latestPHQ9.severity}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getTrendText(phq9Trend)}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No PHQ-9 assessments yet</p>
              <p className="text-xs mt-1">Take an assessment to track your progress</p>
            </div>
          )}
        </Card>

        {/* GAD-7 (Anxiety) */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-darkTeal">Anxiety Screening (GAD-7)</h2>
            {gad7Trend !== 0 && (
              <div className="flex items-center gap-1 text-sm">
                {getTrendIcon(gad7Trend)}
                <span className={gad7Trend < 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(gad7Trend)} pts
                </span>
              </div>
            )}
          </div>
          {gad7Data.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={gad7Data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                  <YAxis domain={[0, 21]} style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#60A5FA" strokeWidth={2} dot={{ fill: '#60A5FA' }} />
                </LineChart>
              </ResponsiveContainer>
              {latestGAD7 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Latest Score:</strong> {latestGAD7.score}/21 - {latestGAD7.severity}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getTrendText(gad7Trend)}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No GAD-7 assessments yet</p>
              <p className="text-xs mt-1">Take an assessment to track your progress</p>
            </div>
          )}
        </Card>
      </div>

      {/* Mood Trends */}
      {moodData.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-darkTeal mb-4">Mood Trends (Journal Entries)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={moodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" style={{ fontSize: '12px' }} />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} style={{ fontSize: '12px' }} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
                        <p className="text-sm font-medium">{payload[0].payload.date}</p>
                        <p className="text-sm text-gray-600 capitalize">{payload[0].payload.moodLabel}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="mood" fill="#A855F7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
            <span>1 - Struggling</span>
            <span>2 - Low</span>
            <span>3 - Okay</span>
            <span>4 - Good</span>
            <span>5 - Great</span>
          </div>
        </Card>
      )}

      {/* Activity Summary */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-darkTeal mb-4">Activity Summary (Last 30 Days)</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-lightTeal/10 rounded-lg">
            <div className="text-3xl font-bold text-teal mb-1">{data.activityLast30Days}</div>
            <p className="text-sm text-gray-600">Active Days</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {Math.round((data.activityLast30Days / 30) * 100)}%
            </div>
            <p className="text-sm text-gray-600">Consistency</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {data.activityLast30Days >= 21 ? '🔥' : data.activityLast30Days >= 14 ? '⭐' : '💪'}
            </div>
            <p className="text-sm text-gray-600">
              {data.activityLast30Days >= 21 ? 'On Fire!' : data.activityLast30Days >= 14 ? 'Great Job!' : 'Keep Going!'}
            </p>
          </div>
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6 bg-gradient-to-r from-teal/10 to-softBlue/10">
        <h2 className="text-lg font-semibold text-darkTeal mb-3 flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Insights & Recommendations
        </h2>
        <div className="space-y-2">
          {data.overview.journalEntries < 5 && (
            <p className="text-sm text-gray-700">
              📝 <strong>Try journaling more!</strong> Regular journaling can help you process emotions and track patterns.
            </p>
          )}
          {data.overview.groupSessions === 0 && (
            <p className="text-sm text-gray-700">
              👥 <strong>Join a group session!</strong> Connecting with others who understand can be incredibly healing.
            </p>
          )}
          {phq9Trend > 3 && (
            <p className="text-sm text-gray-700">
              ⚠️ <strong>Your depression score has increased.</strong> Consider reaching out to a therapist or your support system.
            </p>
          )}
          {gad7Trend > 3 && (
            <p className="text-sm text-gray-700">
              ⚠️ <strong>Your anxiety score has increased.</strong> Try some relaxation techniques or speak with a professional.
            </p>
          )}
          {data.activityLast30Days >= 20 && (
            <p className="text-sm text-gray-700">
              🎉 <strong>Amazing consistency!</strong> You're showing up for yourself regularly - keep it up!
            </p>
          )}
          {data.overview.totalEngagement > 200 && (
            <p className="text-sm text-gray-700">
              ⭐ <strong>High engagement!</strong> Your commitment to your mental health journey is inspiring!
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
