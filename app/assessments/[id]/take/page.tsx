import { getServerSessionOrDemo as getServerSession } from '@/lib/auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { AssessmentForm } from '@/components/assessment-form'

export const dynamic = 'force-dynamic'

export default async function TakeAssessmentPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/login')
  }

  const assessment = await prisma.assessment.findUnique({
    where: { id: params.id },
  })

  if (!assessment) {
    redirect('/assessments')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-darkTeal mb-2">{assessment.title}</h1>
          <p className="text-gray-600">{assessment.description}</p>
        </div>

        <AssessmentForm
          assessment={assessment}
          userId={session.user.id}
        />
      </div>
    </div>
  )
}
