import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, inviteeEmailTemplate } from '@/lib/email'
import { generateQRCodeDataURL, rsvpUrl } from '@/lib/qrcode'
import { z } from 'zod'

const schema = z.object({
  subject:      z.string().min(1),
  message:      z.string().min(1),
  inviteeIds:   z.array(z.string()).min(1),
  includeQR:    z.boolean().optional().default(true),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const logs = await prisma.emailLog.findMany({ orderBy: { sentAt: 'desc' }, take: 50 })
  return NextResponse.json(logs)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

  const { subject, message, inviteeIds, includeQR } = parsed.data

  const invitees = await prisma.invitee.findMany({
    where: { id: { in: inviteeIds }, email: { not: null } },
  })

  const results = await Promise.allSettled(
    invitees.map(async inv => {
      if (!inv.email) return

      let html: string
      if (includeQR) {
        const qr = await generateQRCodeDataURL(rsvpUrl(inv.qrCode))
        html = inviteeEmailTemplate({
          name:        inv.name,
          qrCodeDataUrl: qr,
          message,
          weddingDate: 'Saturday, 19 December 2026',
          venue:       'Bethany Methodist Church, Dzorwulu, Accra',
          mapLink:     'https://maps.google.com/?q=Bethany+Methodist+Church,+Dzorwulu,+Accra,+Ghana',
        })
      } else {
        html = `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#6b21a8;">Dear ${inv.name},</h2>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <p style="color:#888;">— Ekow &amp; Ekua</p>
        </div>`
      }

      await sendEmail({ to: inv.email, subject, html })
    })
  )

  const sent      = results.filter(r => r.status === 'fulfilled').length
  const failed    = results.filter(r => r.status === 'rejected').length
  const recipients = invitees.map(i => i.email).filter(Boolean)

  await prisma.emailLog.create({
    data: {
      subject,
      body:       message,
      recipients: JSON.stringify(recipients),
      status:     failed > 0 ? `sent:${sent}/failed:${failed}` : 'sent',
    },
  })

  return NextResponse.json({ sent, failed })
}
