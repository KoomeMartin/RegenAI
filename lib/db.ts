import { PrismaClient } from '@prisma/client'
import demo from './demo-data'

// Allow running the app in "demo" mode without a real database by
// setting `USE_PREDEFINED_USERS=true` in the environment. In that
// case we export a lightweight mock Prisma client that returns demo
// objects for common model methods used throughout the app.

type AnyObj = { [k: string]: any }

function createMockPrisma() {
  const methodHandler = (model: string) => {
    // Normalize model name so generated Prisma client property names
    // (e.g. `aISession`) and simpler camelCase names (`aiSession`) both
    // resolve to the same mock implementation. We lowercase only the
    // first character which matches how Prisma client exposes model
    // properties (model name with lowercased leading character).
    const modelKey = typeof model === 'string' && model.length > 0
      ? model.charAt(0).toLowerCase() + model.slice(1)
      : model
    const modelKeyLower = typeof modelKey === 'string' ? modelKey.toLowerCase() : modelKey
    return {
      findMany: async (params?: any) => {
        const where = params?.where || {}
        const orderBy = params?.orderBy
        const take = params?.take
        const skip = params?.skip || 0

        let result: any[] = []

        if (modelKeyLower === 'assessment') result = demo.assessments
        else if (modelKeyLower === 'assessmentresponse') {
          result = demo.assessmentResponses
          // Filter by userId if provided
          if (where.userId) {
            result = result.filter((r: any) => r.userId === where.userId)
          }
          // Filter by assessment type if provided
          if (where.assessment?.type?.in) {
            result = result.filter((r: any) => where.assessment.type.in.includes(r.assessment?.type))
          }
        } else if (modelKeyLower === 'groupsession') {
          result = demo.sessions
          // Filter scheduled sessions in the future
          if (where.scheduledAt?.gte) {
            result = result.filter((s: any) => new Date(s.scheduledAt) >= where.scheduledAt.gte)
          }
          if (where.status) {
            result = result.filter((s: any) => s.status === where.status)
          }
        } else if (modelKeyLower === 'groupsessionparticipant') {
          result = demo.participants
          if (where.userId) {
            result = result.filter((p: any) => p.userId === where.userId)
          }
        } else if (modelKeyLower === 'groupmessage') result = demo.groupMessages
        else if (modelKeyLower === 'user') {
          result = demo.users
          if (where.id) {
            result = result.filter((u: any) => u.id === where.id)
          }
        } else if (modelKeyLower === 'therapist') result = demo.therapists
        else if (modelKeyLower === 'therapistprofile') {
          result = demo.therapistProfiles
          if (where.verified) {
            result = result.filter((t: any) => t.verified === where.verified)
          }
        } else if (modelKeyLower === 'therapybooking') {
          result = demo.therapyBookings
          if (where.clientId) {
            result = result.filter((b: any) => b.clientId === where.clientId)
          }
        } else if (modelKeyLower === 'journal') {
          result = demo.journals
          if (where.userId) {
            result = result.filter((j: any) => j.userId === where.userId)
          }
        } else if (modelKeyLower === 'notification') {
          result = demo.notifications
          if (where.userId) {
            result = result.filter((n: any) => n.userId === where.userId)
          }
        } else if (modelKeyLower === 'educationcontent' || modelKeyLower === 'learningresource') {
          result = demo.educationContent
          if (where.category && where.category !== 'all') {
            result = result.filter((c: any) => c.category === where.category)
          }
          if (where.difficulty && where.difficulty !== 'all') {
            result = result.filter((c: any) => c.difficulty === where.difficulty)
          }
          if (where.featured) {
            result = result.filter((c: any) => c.featured === where.featured)
          }
        } else if (modelKeyLower === 'referral' || modelKeyLower === 'referralresource') {
          result = demo.referrals
        } else if (modelKeyLower === 'aisession') {
          result = demo.aiSessions
          if (where.userId) {
            result = result.filter((a: any) => a.userId === where.userId)
          }
        }

        // Apply ordering
        if (orderBy) {
          const [field, direction] = Object.entries(orderBy)[0] as [string, string]
          result.sort((a, b) => {
            const aVal = a[field]
            const bVal = b[field]
            if (aVal < bVal) return direction === 'asc' ? -1 : 1
            if (aVal > bVal) return direction === 'asc' ? 1 : -1
            return 0
          })
        }

        // Apply pagination
        if (take) {
          result = result.slice(skip, skip + take)
        }

        return result
      },

      findUnique: async (params?: any) => {
        const where = params?.where || {}
        const id = where?.id
        const email = where?.email
        const alias = where?.alias
        const slug = where?.slug

        const sourceMap: Record<string, any[]> = {
          user: demo.users,
          assessment: demo.assessments,
          assessmentResponse: demo.assessmentResponses,
          groupSession: demo.sessions,
          groupSessionParticipant: demo.participants,
          groupMessage: demo.groupMessages,
          therapist: demo.therapists,
          therapistProfile: demo.therapistProfiles,
          therapyBooking: demo.therapyBookings,
          notification: demo.notifications,
          journal: demo.journals,
          educationContent: demo.educationContent,
          learningResource: demo.educationContent,
          referral: demo.referrals,
          referralResource: demo.referrals,
          aiSession: demo.aiSessions,
        }

        const arr = sourceMap[model] ?? []
        if (id) return arr.find((x) => x.id === id) ?? null
        if (email) return arr.find((x) => x.email === email) ?? null
        if (alias) return arr.find((x) => x.alias === alias) ?? null
        if (slug) return arr.find((x) => x.slug === slug) ?? null
        return null
      },

      findFirst: async (params?: any) => {
        const where = params?.where || {}
        const id = where?.id
        const email = where?.email

        const sourceMap: Record<string, any[]> = {
          user: demo.users,
          assessment: demo.assessments,
          assessmentResponse: demo.assessmentResponses,
          groupSession: demo.sessions,
          groupSessionParticipant: demo.participants,
          groupMessage: demo.groupMessages,
          therapist: demo.therapists,
          therapistProfile: demo.therapistProfiles,
          therapyBooking: demo.therapyBookings,
          notification: demo.notifications,
          journal: demo.journals,
          educationContent: demo.educationContent,
          learningResource: demo.educationContent,
          referral: demo.referrals,
          referralResource: demo.referrals,
          aiSession: demo.aiSessions,
        }

        const arr = sourceMap[model] ?? []
        if (id) return arr.find((x) => x.id === id) ?? null
        if (email) return arr.find((x) => x.email === email) ?? null
        return arr[0] ?? null
      },

      count: async (params?: any) => {
        const where = params?.where || {}

        if (modelKey === 'groupSessionParticipant') {
          let count = demo.participants.length
          if (where.userId) {
            count = demo.participants.filter((p: any) => p.userId === where.userId).length
          }
          return count
        }
        if (modelKey === 'aiSession') {
          if (where.userId) {
            return demo.aiSessions.filter((a: any) => a.userId === where.userId).length
          }
          return demo.aiSessions.length
        }
        if (modelKey === 'assessmentResponse') {
          if (where.userId) {
            return demo.assessmentResponses.filter((r: any) => r.userId === where.userId).length
          }
          return demo.assessmentResponses.length
        }
        if (modelKey === 'journal') {
          if (where.userId) {
            return demo.journals.filter((j: any) => j.userId === where.userId).length
          }
          return demo.journals.length
        }
        if (modelKey === 'therapyBooking') {
          if (where.clientId) {
            return demo.therapyBookings.filter((b: any) => b.clientId === where.clientId).length
          }
          return demo.therapyBookings.length
        }
        if (modelKey === 'notification') {
          if (where.userId) {
            return demo.notifications.filter((n: any) => n.userId === where.userId).length
          }
          return demo.notifications.length
        }
        if (modelKey === 'groupSession') {
          return demo.sessions.length
        }
        if (modelKey === 'educationContent' || modelKey === 'learningResource') {
          return demo.educationContent.length
        }
        if (modelKey === 'referral' || modelKey === 'referralResource') {
          return demo.referrals.length
        }
        if (modelKey === 'therapistProfile') {
          return demo.therapistProfiles.length
        }
        return 0
      },

      create: async (params?: any) => {
        const data = params?.data || {}
        const timestamp = new Date().toISOString()
        return { 
          id: `mock-${Date.now()}`, 
          createdAt: timestamp,
          updatedAt: timestamp,
          ...data 
        }
      },

      update: async (params?: any) => {
        const data = params?.data || {}
        return { 
          updatedAt: new Date().toISOString(),
          ...data 
        }
      },

      delete: async (params?: any) => {
        return null
      },
    }
  }

  return new Proxy({}, {
    get(_target, modelName: string | symbol) {
      return methodHandler(String(modelName))
    },
  }) as any
}

const globalForPrisma = globalThis as any

export const prisma: any = process.env.USE_PREDEFINED_USERS === 'true'
  ? createMockPrisma()
  : globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production' && process.env.USE_PREDEFINED_USERS !== 'true') {
  globalForPrisma.prisma = prisma
}
