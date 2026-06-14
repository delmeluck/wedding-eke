import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

/*
  Auth — pure JWT, zero database dependency.
  CredentialsProvider validates directly against ADMIN_EMAIL / ADMIN_PASSWORD
  env vars so the admin login works whether or not a DB is connected.

  When you connect a real Neon DB in the future, re-add PrismaAdapter +
  EmailProvider here and remove the adapter: undefined line.
*/
export const authOptions: NextAuthOptions = {
  adapter:  undefined,
  session:  { strategy: 'jwt' },
  pages: {
    signIn:        '/admin/login',
    error:         '/admin/login',
    verifyRequest: '/admin/verify',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const adminEmail    = (process.env.ADMIN_EMAIL    ?? '').toLowerCase().trim()
        const adminPassword = (process.env.ADMIN_PASSWORD ?? '').trim()

        if (!adminEmail || !adminPassword) return null
        if (credentials.email.toLowerCase().trim() !== adminEmail) return null
        if (credentials.password.trim()             !== adminPassword) return null

        return {
          id:    'admin',
          email: process.env.ADMIN_EMAIL!,
          name:  'Admin',
          role:  'admin',
        }
      },
    }),
  ],
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
