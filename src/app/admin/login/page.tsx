'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Mail, Lock, Send } from 'lucide-react'

export default function LoginPage() {
  const params = useSearchParams()
  const error  = params.get('error')

  const [tab, setTab]         = useState<'magic' | 'password'>('magic')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await signIn('email', { email, callbackUrl: '/admin', redirect: false })
    setLoading(false)
    setSent(true)
  }

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await signIn('credentials', { email, password, callbackUrl: '/admin' })
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-purple-950 px-8 py-10 text-center">
          <div className="font-script text-6xl text-gold mb-1">E &amp; E</div>
          <p className="text-lavender-300 text-sm">Admin Dashboard</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
              {error === 'OAuthSignin' ? 'Sign in failed. Please try again.' : `Error: ${error}`}
            </div>
          )}

          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden border border-lavender-200 mb-6">
            <button
              onClick={() => setTab('magic')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === 'magic' ? 'bg-purple-800 text-white' : 'text-earth-600 hover:bg-lavender-50'
              }`}
            >
              Magic Link
            </button>
            <button
              onClick={() => setTab('password')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === 'password' ? 'bg-purple-800 text-white' : 'text-earth-600 hover:bg-lavender-50'
              }`}
            >
              Password
            </button>
          </div>

          {sent ? (
            <div className="text-center py-8">
              <Send size={40} className="text-purple-700 mx-auto mb-3" />
              <h3 className="font-serif text-xl text-purple-900 mb-2">Check Your Email</h3>
              <p className="text-earth-600 text-sm">
                We&apos;ve sent a sign-in link to <strong>{email}</strong>.<br />
                Click the link to access the admin dashboard.
              </p>
            </div>
          ) : tab === 'magic' ? (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="admin@wedding.com"
                    className="input-field pl-9"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending…' : 'Send Magic Link'}
              </button>
              <p className="text-earth-400 text-xs text-center">
                A secure sign-in link will be emailed to you
              </p>
            </form>
          ) : (
            <form onSubmit={handleCredentials} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="admin@wedding.com"
                    className="input-field pl-9"
                  />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="input-field pl-9"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
