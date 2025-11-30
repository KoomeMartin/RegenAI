import { prisma } from '@/lib/db'
import Link from 'next/link'
import { MessageCircle, Users, ClipboardList, Calendar, TrendingUp, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // Mock user session for demo mode (no auth required)
  const session = {
    user: {
      id: 'demo-1',
      email: 'demo@example.com',
      alias: 'Demo User',
      avatar: '',
    },
  }

  // Fetch ALL demo data - don't filter by userId to show all features
  const [recentAssessments, upcomingSessions, sessionCount] = await Promise.all([
    prisma.assessmentResponse.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { assessment: true },
    }),
    prisma.groupSession.findMany({
      where: {
        scheduledAt: { gte: new Date() },
        status: 'scheduled',
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
    }),
    // Some environments (demo/mock) or Prisma client generations may not
    // expose `aISession` in the same shape; guard to avoid calling `count`
    // on undefined during SSR/runtime.
    (async () => {
      try {
        if (prisma?.aISession && typeof prisma.aISession.count === 'function') {
          return await prisma.aISession.count({})
        }
      } catch (e) {
        // swallow and fallthrough to 0
      }
      return 0
    })(),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-darkTeal mb-2">
          Welcome back, {session.user.alias}
        </h1>
        <p className="text-gray-600">How are you feeling today?</p>
      </div>

      {/* Crisis Alert */}
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-8">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">In Crisis?</h3>
            <p className="text-sm text-red-700">
              If you're experiencing a mental health emergency, please call your local crisis helpline immediately.
              <strong className="bg-red-100 text-red-700 px-2 py-0.5 rounded"> 0800-123-4567</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <QuickAccessCard
          href="/ai-support"
          icon={<MessageCircle className="h-8 w-8 text-teal" />}
          title="Chat with AI"
          description="Get immediate emotional support"
          bgColor="bg-teal/10"
        />
        <QuickAccessCard
          href="/group-sessions"
          icon={<Users className="h-8 w-8 text-softBlue" />}
          title="Join Group Session"
          description="Connect with peers"
          bgColor="bg-softBlue/10"
        />
        <QuickAccessCard
          href="/assessments"
          icon={<ClipboardList className="h-8 w-8 text-purple-500" />}
          title="Take Assessment"
          description="Track your progress"
          bgColor="bg-purple-100"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Mental Health Stats */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-6 w-6 text-teal" />
            <h2 className="text-xl font-bold text-darkTeal">Your Journey</h2>
          </div>
          <div className="space-y-4">
            <StatItem label="AI Chat Sessions" value={sessionCount?.toString() ?? '0'} />
            <StatItem label="Assessments Completed" value={recentAssessments?.length?.toString() ?? '0'} />
            {recentAssessments?.[0] && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Latest Assessment</p>
                <p className="font-semibold text-darkTeal">{recentAssessments[0].assessment?.title}</p>
                <p className="text-sm text-gray-500">
                  Score: {recentAssessments[0].score ?? 'N/A'} | {recentAssessments[0].severity ?? 'N/A'}
                </p>
              </div>
            )}
          </div>
          {recentAssessments?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No assessments yet</p>
              <Link
                href="/assessments"
                className="inline-block px-4 py-2 bg-teal text-white rounded-lg hover:bg-darkTeal transition-colors"
              >
                Take Your First Assessment
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming Group Sessions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-6 w-6 text-softBlue" />
            <h2 className="text-xl font-bold text-darkTeal">Upcoming Sessions</h2>
          </div>
          {upcomingSessions && upcomingSessions.length > 0 ? (
            <div className="space-y-3">
              {upcomingSessions.map((session: any) => (
                <div
                  key={session.id}
                  className="p-4 bg-gradient-to-r from-teal/10 to-softBlue/10 rounded-lg hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-darkTeal mb-1">{session.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{session.topic}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(session.scheduledAt).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
              <Link
                href="/group-sessions"
                className="block text-center px-4 py-2 bg-softBlue text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                View All Sessions
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No upcoming sessions</p>
              <Link
                href="/group-sessions"
                className="inline-block px-4 py-2 bg-softBlue text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Browse Sessions
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function QuickAccessCard({
  href,
  icon,
  title,
  description,
  bgColor,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  bgColor: string
}) {
  return (
    <Link
      href={href}
      className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1"
    >
      <div className={`${bgColor} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-darkTeal mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-lg font-bold text-teal">{value}</span>
    </div>
  )
}
