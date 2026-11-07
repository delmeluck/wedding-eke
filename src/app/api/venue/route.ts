import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Venues revealed to confirmed RSVPs
const VENUES = [
  {
    label:       'Engagement Ceremony',
    date:        'Wednesday, 17 December 2026',
    time:        'TBC',
    place:       'Kasoa',
    address:     'Kasoa, Central Region, Ghana',
    emoji:       '💍',
    mapQuery:    'Kasoa,+Central+Region,+Ghana',
    directions:  'https://maps.google.com/?q=Kasoa,+Ghana',
    appleMaps:   'https://maps.apple.com/?q=Kasoa,+Ghana',
  },
  {
    label:       'Wedding Ceremony',
    date:        'Friday, 19 December 2026',
    time:        'TBC',
    place:       'Bethany Methodist Church',
    address:     'Dzorwulu, Accra, Ghana',
    emoji:       '💒',
    mapQuery:    'Bethany+Methodist+Church,+Dzorwulu,+Accra,+Ghana',
    directions:  'https://maps.google.com/?q=Bethany+Methodist+Church,+Dzorwulu,+Accra,+Ghana',
    appleMaps:   'https://maps.apple.com/?q=Bethany+Methodist+Church,+Dzorwulu+Accra',
  },
]

// GET /api/venue?code=XXXXXXXX
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')?.toUpperCase().trim()

  if (!code || code.length < 6) {
    return NextResponse.json({ valid: false, error: 'No code provided' }, { status: 400 })
  }

  try {
    // Find invitee whose qrCode starts with this code (first 8 chars, no dashes)
    const invitees = await prisma.invitee.findMany({
      where:  { rsvp: { attending: true } },
      select: { qrCode: true, name: true },
    })

    const match = invitees.find(
      inv => inv.qrCode.replace(/-/g, '').slice(0, 8).toUpperCase() === code
    )

    if (!match) {
      return NextResponse.json({ valid: false, error: 'Invalid or unrecognised code' }, { status: 404 })
    }

    return NextResponse.json({ valid: true, name: match.name, venues: VENUES })
  } catch {
    return NextResponse.json({ valid: false, error: 'Server error' }, { status: 500 })
  }
}
