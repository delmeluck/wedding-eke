import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database…')

  // Admin user
  const adminEmail    = process.env.ADMIN_EMAIL    ?? 'admin@wedding.com'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'wedding2026!'

  await prisma.user.upsert({
    where:  { email: adminEmail },
    update: {},
    create: {
      email:    adminEmail,
      name:     'Wedding Admin',
      role:     'admin',
      password: await bcrypt.hash(adminPassword, 12),
    },
  })
  console.log(`✅ Admin user: ${adminEmail}`)

  // Site content defaults
  const contentDefaults = [
    { key: 'contact_person_name',   value: 'Contact Person' },
    { key: 'contact_person_phone',  value: '+233 24 000 0000' },
    { key: 'rsvp_deadline',         value: '1 November 2026' },
    { key: 'dress_code_note',       value: 'Smart Formal / African Formal — Please embrace our wedding colour palette of purple, lavender, earth tones and gold.' },
    { key: 'hero_tagline',          value: 'Two hearts, one journey' },
  ]

  for (const c of contentDefaults) {
    await prisma.siteContent.upsert({
      where:  { key: c.key },
      update: {},
      create: c,
    })
  }
  console.log('✅ Site content defaults')

  // Venues
  await prisma.venue.upsert({
    where: { id: 'venue-engagement' },
    update: {},
    create: {
      id:          'venue-engagement',
      name:        'Engagement Venue',
      type:        'engagement',
      address:     'Kasoa',
      city:        'Central Region',
      description: 'Engagement celebration venue',
      eventDate:   '17/12/26',
      eventTime:   'TBA',
      mapLink:     'https://maps.google.com/?q=Kasoa,+Ghana',
    },
  })

  await prisma.venue.upsert({
    where: { id: 'venue-wedding' },
    update: {},
    create: {
      id:          'venue-wedding',
      name:        'Bethany Methodist Church',
      type:        'ceremony',
      address:     'Dzorwulu',
      city:        'Accra',
      description: 'Wedding ceremony venue',
      eventDate:   '19/12/26',
      eventTime:   '10:00 AM',
      mapLink:     'https://maps.google.com/?q=Bethany+Methodist+Church,+Dzorwulu,+Accra,+Ghana',
    },
  })
  console.log('✅ Venues')

  // Agenda
  const agendaItems = [
    { id: 'agenda-1', title: 'Guests Arrive',          time: '9:30 AM',  eventDate: '19/12/26', sortOrder: 1, icon: '🚗' },
    { id: 'agenda-2', title: 'Wedding Ceremony Begins', time: '10:00 AM', eventDate: '19/12/26', sortOrder: 2, icon: '💒' },
    { id: 'agenda-3', title: 'Exchange of Vows',        time: '10:30 AM', eventDate: '19/12/26', sortOrder: 3, icon: '💍' },
    { id: 'agenda-4', title: 'Signing of Register',     time: '11:00 AM', eventDate: '19/12/26', sortOrder: 4, icon: '📝' },
    { id: 'agenda-5', title: 'Recessional',             time: '11:30 AM', eventDate: '19/12/26', sortOrder: 5, icon: '🎉' },
    { id: 'agenda-6', title: 'Photography Session',     time: '12:00 PM', eventDate: '19/12/26', sortOrder: 6, icon: '📸' },
    { id: 'agenda-7', title: 'Reception & Celebrations', time: '1:00 PM', eventDate: '19/12/26', sortOrder: 7, icon: '🥂' },
  ]

  for (const item of agendaItems) {
    await prisma.agendaItem.upsert({
      where:  { id: item.id },
      update: {},
      create: { ...item, description: '' },
    })
  }
  console.log('✅ Agenda items')

  // Sample gift items
  const gifts = [
    {
      id:           'gift-1',
      name:         'Kitchen Aid Stand Mixer',
      description:  'A classic addition to the kitchen',
      price:        2500,
      category:     'Kitchen',
      priority:     3,
    },
    {
      id:           'gift-2',
      name:         'Bed Linen Set (King)',
      description:  'High thread-count cotton linen',
      price:        800,
      category:     'Bedroom',
      priority:     2,
    },
    {
      id:           'gift-3',
      name:         'Honeymoon Contribution',
      description:  'Help us create beautiful honeymoon memories',
      category:     'Experience',
      priority:     5,
      donationLink: '#',
    },
  ]

  for (const g of gifts) {
    await prisma.gift.upsert({
      where:  { id: g.id },
      update: {},
      create: g,
    })
  }
  console.log('✅ Sample gifts')

  console.log('\n🎉 Database seeded successfully!')
  console.log(`\n📧 Admin login: ${adminEmail}`)
  console.log(`🔑 Password: ${adminPassword}`)
  console.log('\nChange these in your .env.local before deploying!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
