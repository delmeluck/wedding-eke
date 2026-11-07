import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  const invitee = await prisma.invitee.findFirst({
    where: { email: { equals: email.toLowerCase() } },
    include: { rsvp: true },
  })

  if (!invitee) {
    // Check whether open RSVP mode is enabled
    const modeSetting = await prisma.siteContent.findUnique({ where: { key: 'rsvp_open_mode' } })
    const openMode = modeSetting?.value !== 'false'
    return NextResponse.json({ error: 'Not found', openMode }, { status: 404 })
  }

  return NextResponse.json(invitee)
}
