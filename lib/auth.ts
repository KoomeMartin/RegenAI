import { NextAuthOptions, getServerSession as nextAuthGetServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Predefined demo users (editable)
// You can add as many demo users as you want for local development.
export const predefinedUsers = [
  {
    id: 'demo-1',
    email: 'demo@mentalhealth.com',
    password: 'demo123',
    alias: 'Demo User',
    avatar: '',
    role: 'user',
  },
  {
    id: 'demo-2',
    email: 'therapist@mentalhealth.com',
    password: 'therapist123',
    alias: 'Demo Therapist',
    avatar: '',
    role: 'therapist',
  },
]

function findPredefinedUserByEmail(email?: string) {
  if (!email) return undefined
  return predefinedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())
}

// Type augmentation for `next-auth` is defined in `types/next-auth.d.ts`.
// Keeping type declarations centralized avoids duplicate-declaration errors.

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // First, try to match a predefined demo user (local dev / no backend)
        const demoUser = findPredefinedUserByEmail(credentials.email)
        if (demoUser && credentials.password === demoUser.password) {
          return {
            id: demoUser.id,
            email: demoUser.email,
            alias: demoUser.alias,
            avatar: demoUser.avatar,
            role: demoUser.role,
          }
        }

        // Optional: allow a global "demo" password for any demo user when env flag set
        if (process.env.ALLOW_DEMO_PASSWORD === 'true' && demoUser && credentials.password === 'demo') {
          return {
            id: demoUser.id,
            email: demoUser.email,
            alias: demoUser.alias,
            avatar: demoUser.avatar,
            role: demoUser.role,
          }
        }

        // No match: return null (invalid credentials)
        return null
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        // token.alias = user.alias
        token.avatar = user.avatar
        token.role = user.role
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        // session.user.alias = token.alias
        session.user.avatar = token.avatar
        session.user.role = token.role
      }
      return session
    },
  },

  pages: {
    signIn: '/auth/login',
  },

  session: {
    strategy: 'jwt',
  },

  secret: process.env.NEXTAUTH_SECRET,
}

// Demo-friendly getServerSession wrapper.
// When `USE_PREDEFINED_USERS=true` we return the first demo user as a session
// so server-side code that calls `getServerSession(authOptions)` continues
// to work without requiring actual authentication.
export async function getServerSessionOrDemo(options?: any): Promise<any> {
  if (process.env.USE_PREDEFINED_USERS === 'true') {
    const demo = predefinedUsers[0]
    if (!demo) return null
    return {
      user: {
        id: demo.id,
        email: demo.email,
        alias: demo.alias,
        avatar: demo.avatar,
        role: demo.role,
      },
    }
  }

  // Fallback to the real next-auth implementation
  return await nextAuthGetServerSession(options)
}
