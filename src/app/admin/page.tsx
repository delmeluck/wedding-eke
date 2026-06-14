import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Users, CalendarCheck, Gift, Camera, Mail, CheckCircle, XCircle, Clock } from 'lucide-react'

async function getStats() {
  const [
    totalInvitees,
    rsvpYes,
    rsvpNo,
    rsvpPending,
    totalGifts,
    claimedGifts,
    totalMedia,
    recentEmails,
  ] = await Promise.all([
    prisma.invitee.count(),
    prisma.rSVP.count({ where: { attending: true } }),
    prisma.rSVP.count({ where: { attending: false } }),
    prisma.invitee.count({ where: { rsvp: null } }),
    prisma.gift.count(),
    prisma.gift.count({ where: { claimed: true } }),
    prisma.mediaItem.count(),
    prisma.emailLog.findMany({ orderBy: { sentAt: 'desc' }, take: 5 }),
  ])
  return { totalInvitees, rsvpYes, rsvpNo, rsvpPending, totalGifts, claimedGifts, totalMedia, recentEmails }
}

export default async function AdminDashboard() {
  const s = await getStats()

  const stats = [
    { label: 'Total Invitees', value: s.totalInvitees, icon: Users,        color: 'purple', href: '/admin/invitees' },
    { label: 'Attending',      value: s.rsvpYes,       icon: CheckCircle,  color: 'green',  href: '/admin/reservations' },
    { label: 'Not Attending',  value: s.rsvpNo,        icon: XCircle,      color: 'red',    href: '/admin/reservations' },
    { label: 'Awaiting RSVP',  value: s.rsvpPending,   icon: Clock,        color: 'amber',  href: '/admin/reservations' },
    { label: 'Gallery Items',  value: s.totalMedia,    icon: Camera,       color: 'blue',   href: '/admin/gallery' },
    { label: 'Gifts Claimed',  value: `${s.claimedGifts}/${s.totalGifts}`, icon: Gift, color: 'gold', href: '/admin/gifts' },
  ]

  const colorMap: Record<string, string> = {
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    green:  'bg-green-50  text-green-700  border-green-100',
    red:    'bg-red-50    text-red-700    border-red-100',
    amber:  'bg-amber-50  text-amber-700  border-amber-100',
    blue:   'bg-blue-50   text-blue-700   border-blue-100',
    gold:   'bg-yellow-50 text-yellow-700 border-yellow-100',
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Wedding of Ekow &amp; Ekua — 19 December 2026</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className={`admin-card border flex flex-col items-center text-center hover:shadow-md transition-shadow ${colorMap[color]}`}>
            <Icon size={24} className="mb-2" />
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs mt-1 opacity-80">{label}</p>
          </Link>
        ))}
      </div>

      {/* RSVP progress bar */}
      <div className="admin-card mb-8">
        <h2 className="font-semibold text-gray-700 mb-4">RSVP Response Rate</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all"
              style={{ width: s.totalInvitees > 0 ? `${((s.rsvpYes + s.rsvpNo) / s.totalInvitees) * 100}%` : '0%' }}
            />
          </div>
          <span className="text-sm text-gray-500 w-12 text-right">
            {s.totalInvitees > 0
              ? `${Math.round(((s.rsvpYes + s.rsvpNo) / s.totalInvitees) * 100)}%`
              : '0%'}
          </span>
        </div>
        <div className="flex gap-6 mt-3 text-sm">
          <span className="text-green-600">✓ Attending: {s.rsvpYes}</span>
          <span className="text-red-500">✗ Declining: {s.rsvpNo}</span>
          <span className="text-amber-600">⏳ Pending: {s.rsvpPending}</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="admin-card">
          <h2 className="font-semibold text-gray-700 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { href: '/admin/invitees',     label: 'Add Invitee',         icon: Users },
              { href: '/admin/emails',       label: 'Send Email Blast',    icon: Mail },
              { href: '/admin/gallery',      label: 'Upload Photos',       icon: Camera },
              { href: '/admin/agenda',       label: 'Edit Program',        icon: CalendarCheck },
            ].map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 text-gray-700">
                <Icon size={16} className="text-purple-600" />
                <span className="text-sm">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <h2 className="font-semibold text-gray-700 mb-4">Recent Emails</h2>
          {s.recentEmails.length === 0 ? (
            <p className="text-gray-400 text-sm">No emails sent yet</p>
          ) : (
            <div className="space-y-2">
              {s.recentEmails.map(e => (
                <div key={e.id} className="text-sm border-b border-gray-50 pb-2 last:border-0">
                  <p className="font-medium text-gray-700 truncate">{e.subject}</p>
                  <p className="text-gray-400 text-xs">
                    {new Date(e.sentAt).toLocaleDateString()} · {e.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
