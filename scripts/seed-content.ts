/**
 * Seed the SiteContent table with hardcoded defaults for any fields
 * not already set by the admin. Run once after deploy:
 *   npx tsx scripts/seed-content.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULTS: Record<string, string> = {
  // Hero
  hero_tagline:      'Two hearts, one journey',
  hero_subtitle:     'Join us as we begin forever',

  // Names (display names shown publicly)
  groom_name:        'Ekow',
  bride_name:        'Ekua',

  // Dates
  wedding_date:      'Friday, 19 December 2026',
  engagement_date:   'Wednesday, 17 December 2026',
  rsvp_deadline:     '1 November 2026',

  // Venues
  venue_wedding:     'Bethany Methodist Church, Dzorwulu, Accra',
  venue_engagement:  'Ghana',

  // Dress code
  dress_code_note:   'Smart Formal · African Formal · Embrace the palette',

  // Section visibility — all on by default
  section_show_hero:      'true',
  section_show_marquee:   'true',
  section_show_mosaic:    'true',
  section_show_savedate:  'true',
  section_show_couple:    'true',
  section_show_gallery:   'true',
  section_show_bento:     'true',
  section_show_rsvp_cta:  'true',

  // Branding
  brand_couple_initials: 'E & E',
  brand_year:            '2026',
}

async function main() {
  for (const [key, value] of Object.entries(DEFAULTS)) {
    // Only set if not already in DB (don't overwrite admin's changes)
    await prisma.siteContent.upsert({
      where:  { key },
      create: { key, value },
      update: {},            // no-op if exists
    })
  }
  console.log(`Seeded ${Object.keys(DEFAULTS).length} content defaults.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
