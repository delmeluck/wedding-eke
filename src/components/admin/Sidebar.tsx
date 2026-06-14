'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Users, CalendarCheck, Gift, Image, Mail,
  MapPin, ListOrdered, FileEdit, LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/admin',              label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/invitees',     label: 'Invitees',     icon: Users },
  { href: '/admin/reservations', label: 'Reservations', icon: CalendarCheck },
  { href: '/admin/agenda',       label: 'Agenda',       icon: ListOrdered },
  { href: '/admin/venues',       label: 'Venues',       icon: MapPin },
  { href: '/admin/gifts',        label: 'Gifts',        icon: Gift },
  { href: '/admin/gallery',      label: 'Gallery',      icon: Image },
  { href: '/admin/emails',       label: 'Emails',       icon: Mail },
  { href: '/admin/content',      label: 'Site Content', icon: FileEdit },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-purple-950 min-h-screen flex flex-col">
      <div className="px-6 py-6 border-b border-purple-800">
        <Link href="/admin" className="font-script text-4xl text-gold block">
          E &amp; E
        </Link>
        <p className="text-lavender-400 text-xs mt-1">Admin Dashboard</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-purple-800 text-white'
                  : 'text-lavender-300 hover:text-white hover:bg-purple-900'
              )}
            >
              <Icon size={18} className={active ? 'text-gold' : 'text-lavender-500'} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-purple-800">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-lavender-400 hover:text-white hover:bg-purple-900 transition-colors mb-1"
        >
          View Website
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-lavender-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
