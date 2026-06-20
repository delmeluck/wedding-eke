import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

function reminderEmail({
  name,
  yesUrl,
  noUrl,
  webRsvpUrl,
}: {
  name: string
  yesUrl: string
  noUrl: string
  webRsvpUrl: string
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F5F3FF;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px;">
<table width="580" cellpadding="0" cellspacing="0"
  style="max-width:580px;width:100%;border-radius:18px;overflow:hidden;box-shadow:0 4px 32px rgba(37,32,72,0.15);">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#252048,#5B4E9A);padding:36px 40px;text-align:center;">
    <p style="color:#E6E6FA;font-family:sans-serif;font-size:10px;letter-spacing:.4em;text-transform:uppercase;margin:0 0 8px;">
      Gentle Reminder
    </p>
    <h1 style="color:#C9A84C;font-family:Georgia,serif;font-size:36px;margin:0;font-style:italic;">
      Ekow &amp; Ekua
    </h1>
    <p style="color:#D8BFD8;font-family:sans-serif;font-size:12px;margin:8px 0 0;">
      Wedding · 19 December 2026
    </p>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#fef7ed;padding:40px;">
    <p style="font-size:20px;color:#3D3575;text-align:center;margin:0 0 14px;">
      Dear <em>${name}</em>,
    </p>
    <p style="color:#451a03;line-height:1.85;text-align:center;font-size:15px;margin:0 0 28px;">
      We hope you're well! We wanted to send a gentle reminder that our RSVP deadline is
      <strong>1 November 2026</strong>. We would love to know if you'll be joining us for
      our special celebration.
    </p>

    <!-- RSVP Buttons -->
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#F8F5FF;border:2px solid #E6E6FA;border-radius:14px;margin:0 0 28px;">
      <tr><td style="padding:24px;text-align:center;">
        <p style="font-family:sans-serif;font-size:12px;color:#7B6DAF;margin:0 0 18px;">Will you be joining us?</p>
        <table align="center" cellpadding="0" cellspacing="0"><tr>
          <td style="padding:0 6px;">
            <a href="${yesUrl}" style="display:inline-block;background:#5B4E9A;color:#fff;font-family:sans-serif;font-size:14px;font-weight:700;text-decoration:none;padding:13px 26px;border-radius:50px;">
              🎉 Yes, I'll be there!
            </a>
          </td>
          <td style="padding:0 6px;">
            <a href="${noUrl}" style="display:inline-block;background:#fff;color:#5B4E9A;font-family:sans-serif;font-size:14px;font-weight:600;text-decoration:none;padding:12px 26px;border-radius:50px;border:2px solid #BDB5D5;">
              💌 Can't make it
            </a>
          </td>
        </tr></table>
        <p style="font-family:sans-serif;font-size:11px;color:#BDB5D5;margin:14px 0 0;">
          Or visit: <a href="${webRsvpUrl}" style="color:#7B6DAF;">${webRsvpUrl}</a>
        </p>
      </td></tr>
    </table>

    <p style="font-family:sans-serif;font-size:13px;color:#9B8DC8;text-align:center;margin:0;">
      Your presence would mean the world to us. 💜
    </p>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#252048;padding:24px 40px;text-align:center;">
    <p style="color:#C9A84C;font-family:Georgia,serif;font-size:17px;font-style:italic;margin:0;">
      Ekow &amp; Ekua
    </p>
    <p style="color:#7B6DAF;font-family:sans-serif;font-size:11px;margin:8px 0 0;">
      19 December 2026 · Bethany Methodist Church, Dzorwulu, Accra, Ghana
    </p>
  </td></tr>

</table></td></tr></table>
</body></html>`
}

// POST /api/invitees/send-reminders
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { inviteeIds } = body as { inviteeIds?: string[] }

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://wedding-eke.vercel.app'

  // Find invitees: with email + rsvpToken (was sent invite) + no RSVP yet
  const invitees = await prisma.invitee.findMany({
    where: {
      email:        { not: null },
      rsvpToken:    { not: null },
      inviteSentAt: { not: null },
      rsvp:         null,                              // no response yet
      ...(inviteeIds?.length ? { id: { in: inviteeIds } } : {}),
    },
  })

  let sent = 0
  let failed = 0

  for (const inv of invitees) {
    if (!inv.email || !inv.rsvpToken) continue
    try {
      const yesUrl     = `${baseUrl}/api/rsvp/confirm?token=${inv.rsvpToken}&r=yes`
      const noUrl      = `${baseUrl}/api/rsvp/confirm?token=${inv.rsvpToken}&r=no`
      const webRsvpUrl = `${baseUrl}/rsvp`

      await sendEmail({
        to:      inv.email,
        subject: "Gentle RSVP Reminder — Ekow & Ekua's Wedding 💌",
        html:    reminderEmail({ name: inv.name, yesUrl, noUrl, webRsvpUrl }),
      })

      await prisma.invitee.update({
        where: { id: inv.id },
        data:  { reminderSentAt: new Date() },
      })

      sent++
    } catch {
      failed++
    }
  }

  return NextResponse.json({ sent, failed, total: invitees.length })
}
