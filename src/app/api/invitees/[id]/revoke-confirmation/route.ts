import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, inviteeEmailTemplate } from '@/lib/email'
import { generateQRCodeDataURL, rsvpUrl } from '@/lib/qrcode'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.invitee.update({
    where: { id },
    data:  { confirmationSentAt: null },
  })

  return NextResponse.json({ ok: true })
}

// Resend the confirmation email
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const invitee = await prisma.invitee.findUnique({ where: { id } })
  if (!invitee) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!invitee.email) return NextResponse.json({ error: 'No email address on file' }, { status: 400 })

  const qrDataUrl = await generateQRCodeDataURL(rsvpUrl(invitee.qrCode))
  const html = inviteeEmailTemplate({
    name:         invitee.name,
    qrCodeDataUrl: qrDataUrl,
    weddingDate:  '19 December 2026',
    venue:        'Bethany Methodist Church, Dzorwulu, Accra',
    rsvpLink:     rsvpUrl(invitee.qrCode),
  })

  await sendEmail({
    to:      invitee.email,
    subject: "You're Invited — Ekow & Ekua's Wedding",
    html,
  })

  await prisma.invitee.update({
    where: { id },
    data:  { confirmationSentAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}
