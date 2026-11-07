import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { sendEmail, inviteeEmailTemplate } from '@/lib/email'
import { generateQRCodeDataURL, rsvpUrl } from '@/lib/qrcode'

const schema = z.object({
  // Existing invitee path
  inviteeId:  z.string().optional(),
  // Self-registration path (open mode)
  name:       z.string().optional(),
  email:      z.string().email().optional(),
  // Shared fields
  attending:  z.enum(['yes', 'no']),
  plusOne:    z.boolean().optional().default(false),
  dietaryReq: z.string().optional(),
  message:    z.string().optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

  const { inviteeId, name, email, attending, plusOne, dietaryReq, message } = parsed.data

  let resolvedId = inviteeId

  // Self-registration: create the invitee on the fly
  if (!resolvedId) {
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required for self-registration' }, { status: 400 })
    }

    // Check open mode is still enabled (guards against race if admin toggled it)
    const modeSetting = await prisma.siteContent.findUnique({ where: { key: 'rsvp_open_mode' } })
    if (modeSetting?.value === 'false') {
      return NextResponse.json({ error: 'RSVP is currently by invitation only' }, { status: 403 })
    }

    // Reuse existing record if the email was already self-registered
    const existing = await prisma.invitee.findFirst({ where: { email: email.toLowerCase() } })
    if (existing) {
      resolvedId = existing.id
    } else {
      const created = await prisma.invitee.create({
        data: {
          name,
          email:  email.toLowerCase(),
          qrCode: nanoid(12),
          source: 'self_registered',
        },
      })
      resolvedId = created.id
    }
  }

  const rsvp = await prisma.rSVP.upsert({
    where:  { inviteeId: resolvedId },
    create: { inviteeId: resolvedId, attending: attending === 'yes', plusOne: plusOne ?? false, dietaryReq, message },
    update: { attending: attending === 'yes', plusOne: plusOne ?? false, dietaryReq, message },
  })

  // Send confirmation email if attending and not already sent
  if (attending === 'yes') {
    const invitee = await prisma.invitee.findUnique({ where: { id: resolvedId } })
    if (invitee?.email && !invitee.confirmationSentAt) {
      try {
        const qrDataUrl = await generateQRCodeDataURL(rsvpUrl(invitee.qrCode))
        const html = inviteeEmailTemplate({
          name:        invitee.name,
          qrCodeDataUrl: qrDataUrl,
          weddingDate: '19 December 2026',
          venue:       'Bethany Methodist Church, Dzorwulu, Accra',
          rsvpLink:    rsvpUrl(invitee.qrCode),
        })
        await sendEmail({
          to:      invitee.email,
          subject: "You're Invited — Ekow & Ekua's Wedding",
          html,
        })
        await prisma.invitee.update({
          where: { id: resolvedId },
          data:  { confirmationSentAt: new Date() },
        })
      } catch {
        // Email failure should not block RSVP success
      }
    }
  }

  return NextResponse.json(rsvp)
}
