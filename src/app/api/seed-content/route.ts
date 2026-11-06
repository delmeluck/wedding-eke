import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SEED_SECRET = process.env.SEED_SECRET ?? ''

const DEFAULTS: Record<string, string> = {
  hero_tagline:          'Two hearts, one journey',
  hero_subtitle:         'Join us as we begin forever',
  groom_name:            'Ekow',
  bride_name:            'Ekua',
  wedding_date:          'Friday, 19 December 2026',
  engagement_date:       'Wednesday, 17 December 2026',
  rsvp_deadline:         '1 November 2026',
  venue_wedding:         'Bethany Methodist Church, Dzorwulu, Accra',
  venue_engagement:      'Ghana',
  dress_code_note:       'Smart Formal · African Formal · Embrace the palette',
  section_show_hero:     'true',
  section_show_marquee:  'true',
  section_show_mosaic:   'true',
  section_show_savedate: 'true',
  section_show_couple:   'true',
  section_show_gallery:  'true',
  section_show_bento:    'true',
  section_show_rsvp_cta: 'true',
  brand_couple_initials: 'E & E',
  brand_year:            '2026',
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (!SEED_SECRET || secret !== SEED_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const results: string[] = []
  for (const [key, value] of Object.entries(DEFAULTS)) {
    await prisma.siteContent.upsert({
      where:  { key },
      create: { key, value },
      update: {},
    })
    results.push(key)
  }

  return NextResponse.json({ seeded: results.length, keys: results })
}
