import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import EmailProvider from 'next-auth/providers/email'
import { sendMagicLink } from './email'

/* ─────────────────────────────────────────────────────────
   Auth strategy
   ─ JWT sessions — no database needed for login to work.
   ─ CredentialsProvider validates against ADMIN_EMAIL /
     ADMIN_PASSWORD env vars directly (no DB lookup).
   ─ EmailProvider (magic links) only wired up when BOTH
     a real DB URL and a real email service are configured.
     (magic links require storing a verification token in DB)
───────────────────────────────────────────────────────── */

const dbUrl = process.env.DATABASE_URL ?? ''
const dbReady =
  dbUrl.length > 0 &&
  !dbUrl.includes('placeholder') &&
  !dbUrl.includes('USER:PASSWORD') &&
  dbUrl.startsWith('postgresql')

const emailReady =
  (process.env.EMAIL_PROVIDER === 'resend' && (process.env.RESEND_API_KEY ?? '').startsWith('re_')) ||
  (process.env.EMAIL_PROVIDER === 'smtp'   && Boolean(process.env.EMAIL_SERVER_HOST))

/* Build provider list synchronously */
const providers: NextAuthOptions['providers'] = [
  CredentialsProvider({
    name: 'credentials',
    credentials: {
      email:    { label: 'Email',    type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null

      const adminEmail    = (process.env.ADMIN_EMAIL    ?? '').toLowerCase()
      const adminPassword =  process.env.ADMIN_PASSWORD ?? ''

      if (!adminEmail || !adminPassword) return null
      if (credentials.email.toLowerCase() !== adminEmail) return null
      if (credentials.password             !== adminPassword) return null

      return { id: 'admin', email: process.env.ADMIN_EMAIL!, name: 'Admin', role: 'admin' }
    },
  }),
]

if (emailReady && dbReady) {
  providers.unshift(
    EmailProvider({
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendMagicLink({ identifier, url })
      },
    })
  )
}

/* Only attach Prisma adapter when DB is reachable */
let adapter: NextAuthOptions['adapter'] = undefined
if (dbReady) {
  // Imported lazily so a broken DB URL doesn't crash the module
  try {
    const { PrismaAdapter } = require('@auth/prisma-adapter')
    const { prisma }        = require('./prisma')
    adapter = PrismaAdapter(prisma) as NextAuthOptions['adapter']
  } catch {
    adapter = undefined
  }
}

export const authOptions: NextAuthOptions = {
  adapter,
  session: { strategy: 'jwt' },
  pages: {
    signIn:        '/admin/login',
    error:         '/admin/login',
    verifyRequest: '/admin/verify',
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? 'admin'
        token.id   = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string; id?: string }).role = token.role as string
        ;(session.user as { id?: string }).id = token.id as string
      }
      return session
    },
  },
}
