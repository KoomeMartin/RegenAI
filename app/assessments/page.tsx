import { getServerSessionOrDemo as getServerSession } from '@/lib/auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { ClipboardList, TrendingUp, Calendar, ArrowRight } from 'lucide-react'
import { AssessmentProgressChart } from '@/components/assessment-progress-chart'

export const dynamic = 'force-dynamic'

export default async function AssessmentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  // Get available assessments
  const assessments = await prisma.assessment.findMany({
    orderBy: { createdAt: 'asc' },
  })

  // Get user's assessment responses
  const responses = await prisma.assessmentResponse.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      assessment: true,
    },
  })

  // Get responses for progress chart
  const chartResponses = await prisma.assessmentResponse.findMany({
    where: {
      userId: session.user.id,
      assessment: {
        type: { in: ['PHQ9', 'GAD7'] },
      },
    },
    orderBy: { createdAt: 'asc' },
    include: {
      assessment: true,
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-darkTeal mb-2">Mental Health Assessments</h1>
        <p className="text-gray-600">Track your mental health journey with standardized assessments</p>
      </div>

      {/* Available Assessments */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {assessments?.map((assessment: any) => {
          const latestResponse = responses.find((r: any) => r.assessmentId === assessment.id)
          
          return (
            <Link
              key={assessment.id}
              href={`/assessments/${assessment.id}/take`}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-purple-600" />
                </div>
                {latestResponse && (
                  <span className="text-xs bg-teal/20 text-teal px-2 py-1 rounded">
                    Last: {new Date(latestResponse.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-darkTeal mb-2">{assessment.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{assessment.description}</p>
              <div className="flex items-center text-teal font-medium text-sm">
                Take Assessment
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Progress Chart */}
        {chartResponses && chartResponses.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-6 w-6 text-teal" />
              <h2 className="text-xl font-bold text-darkTeal">Progress Tracking</h2>
            </div>
            <AssessmentProgressChart responses={chartResponses} />
          </div>
        )}

        {/* Recent Assessments */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-6 w-6 text-softBlue" />
            <h2 className="text-xl font-bold text-darkTeal">Recent Assessments</h2>
          </div>
          {responses && responses.length > 0 ? (
            <div className="space-y-3">
              {responses.map((response: any) => (
                <div
                  key={response.id}
                  className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-darkTeal">
                      {response.assessment?.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        response.severity === 'minimal'
                          ? 'bg-green-100 text-green-700'
                          : response.severity === 'mild'
                          ? 'bg-yellow-100 text-yellow-700'
                          : response.severity === 'moderate'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {response.severity ?? 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Score: {response.score ?? 'N/A'}</span>
                    <span>{new Date(response.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No assessments taken yet</p>
              <p className="text-sm text-gray-400">Start tracking your mental health today</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
