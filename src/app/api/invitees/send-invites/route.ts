import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { randomBytes } from 'crypto'

// Generate QR code data URL (base64 PNG)
async function generateQR(url: string): Promise<string> {
  const QRCode = await import('qrcode')
  return QRCode.toDataURL(url, { width: 200, margin: 1, color: { dark: '#252048', light: '#FFFFFF' } })
}

function inviteWithRSVPEmail({
  name,
  yesUrl,
  noUrl,
  qrDataUrl,
  webRsvpUrl,
  customMessage,
}: {
  name: string
  yesUrl: string
  noUrl: string
  qrDataUrl: string
  webRsvpUrl: string
  customMessage?: string
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#F5F3FF;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0"
  style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;box-shadow:0 4px 40px rgba(37,32,72,0.18);">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#252048 0%,#3D3575 35%,#5B4E9A 70%,#4A3D7A 100%);padding:52px 40px;text-align:center;">
    <p style="color:#E6E6FA;font-family:sans-serif;font-size:10px;letter-spacing:.4em;text-transform:uppercase;margin:0 0 14px;">
      You are cordially invited
    </p>
    <h1 style="color:#C9A84C;font-family:Georgia,serif;font-size:54px;margin:0;font-style:italic;line-height:1;">
      E &amp; E
    </h1>
    <p style="color:#D8BFD8;font-family:Georgia,serif;font-size:20px;margin:10px 0 0;font-style:italic;">
      Ekow &amp; Ekua
    </p>
    <div style="margin:20px auto;max-width:160px;height:1px;background:linear-gradient(90deg,transparent,#C9A84C,transparent);"></div>
    <p style="color:#E6E6FA;font-family:sans-serif;font-size:10px;letter-spacing:.3em;text-transform:uppercase;margin:0;">
      Wedding Invitation · December 2026
    </p>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#fef7ed;padding:44px 40px;">

    <p style="font-size:22px;color:#3D3575;text-align:center;margin:0 0 16px;">
      Dear <em>${name}</em>,
    </p>

    <p style="color:#451a03;line-height:1.9;text-align:center;font-size:15px;margin:0 0 32px;max-width:440px;margin-left:auto;margin-right:auto;">
      ${customMessage ?? 'Together with their families, Ekow and Ekua joyfully request the honour of your presence as they exchange their vows and begin their journey as one.'}
    </p>

    <!-- Date & Venue -->
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#fff;border:1px solid #E6E6FA;border-radius:14px;margin:0 0 32px;">
      <tr><td style="padding:24px;text-align:center;">
        <p style="font-family:sans-serif;font-size:10px;color:#7B6DAF;letter-spacing:.3em;text-transform:uppercase;margin:0 0 10px;">Save the Date</p>
        <p style="font-size:13px;color:#7B6DAF;font-family:sans-serif;margin:0 0 4px;">💍 Engagement — Wednesday, 17 December 2026</p>
        <p style="font-size:12px;color:#9B8DC8;font-family:sans-serif;margin:0 0 14px;">Kasoa, Central Region, Ghana</p>
        <p style="font-size:13px;color:#5B4E9A;font-family:sans-serif;font-weight:600;margin:0 0 4px;">💒 Wedding — Friday, 19 December 2026</p>
        <p style="font-size:12px;color:#7B6DAF;font-family:sans-serif;margin:0 0 14px;">Bethany Methodist Church, Dzorwulu, Accra</p>
        <p style="font-family:sans-serif;font-size:12px;color:#9B8DC8;margin:0;">🎨 Dress Code: Smart Formal / African Formal</p>
      </td></tr>
    </table>

    <!-- RSVP Buttons -->
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:linear-gradient(135deg,#F5F3FF,#E6E6FA);border:2px solid #E6E6FA;border-radius:14px;margin:0 0 32px;">
      <tr><td style="padding:28px 24px;text-align:center;">
        <p style="font-family:sans-serif;font-size:11px;color:#7B6DAF;letter-spacing:.3em;text-transform:uppercase;margin:0 0 6px;">Please respond by 1 November 2026</p>
        <p style="font-family:sans-serif;font-size:13px;color:#5B4E9A;margin:0 0 20px;">Will you be joining us?</p>
        <table align="center" cellpadding="0" cellspacing="0"><tr>
          <td style="padding:0 8px;">
            <a href="${yesUrl}" style="display:inline-block;background:#5B4E9A;color:#fff;font-family:sans-serif;font-size:14px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:50px;">
              🎉 Joyfully Accepts
            </a>
          </td>
          <td style="padding:0 8px;">
            <a href="${noUrl}" style="display:inline-block;background:#fff;color:#5B4E9A;font-family:sans-serif;font-size:14px;font-weight:600;text-decoration:none;padding:13px 28px;border-radius:50px;border:2px solid #BDB5D5;">
              💌 Regretfully Declines
            </a>
          </td>
        </tr></table>
        <p style="font-family:sans-serif;font-size:11px;color:#BDB5D5;margin:16px 0 0;">
          Or visit: <a href="${webRsvpUrl}" style="color:#7B6DAF;">${webRsvpUrl}</a>
        </p>
      </td></tr>
    </table>

    <!-- QR Code -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="text-align:center;">
        <p style="font-family:sans-serif;font-size:12px;color:#5B4E9A;font-weight:600;margin:0 0 4px;">Your Personal Check-In QR Code</p>
        <p style="font-family:sans-serif;font-size:11px;color:#9B8DC8;margin:0 0 14px;">Present at the venue entrance</p>
        <img src="${qrDataUrl}" alt="QR Code" width="160" height="160"
          style="border:3px solid #E6E6FA;border-radius:12px;display:block;margin:0 auto;" />
      </td></tr>
    </table>

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#252048;padding:28px 40px;text-align:center;">
    <p style="color:#D8BFD8;font-family:Georgia,serif;font-style:italic;font-size:15px;margin:0 0 6px;">
      With love &amp; joy,
    </p>
    <p style="color:#C9A84C;font-family:Georgia,serif;font-size:20px;font-style:italic;margin:0;">
      Ekow &amp; Ekua
    </p>
    <p style="color:#7B6DAF;font-family:sans-serif;font-size:11px;margin:12px 0 0;">
      19 December 2026 · Bethany Methodist Church, Dzorwulu, Accra, Ghana
    </p>
  </td></tr>

</table></td></tr></table>
</body></html>`
}

// POST /api/invitees/send-invites
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { inviteeIds, customMessage } = await req.json() as {
    inviteeIds?: string[]
    customMessage?: string
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://wedding-eke.vercel.app'

  // Fetch invitees — if no IDs provided, send to all with email
  const where = inviteeIds?.length
    ? { id: { in: inviteeIds }, email: { not: null } }
    : { email: { not: null } }

  const invitees = await prisma.invitee.findMany({ where })

  let sent = 0
  let failed = 0
  const errors: string[] = []

  for (const inv of invitees) {
    if (!inv.email) continue
    try {
      // Generate / reuse rsvpToken
      const token = inv.rsvpToken ?? randomBytes(24).toString('hex')

      // Generate QR code
      const qrUrl     = `${baseUrl}/rsvp?code=${inv.qrCode}`
      const qrDataUrl = await generateQR(qrUrl)

      const yesUrl    = `${baseUrl}/api/rsvp/confirm?token=${token}&r=yes`
      const noUrl     = `${baseUrl}/api/rsvp/confirm?token=${token}&r=no`
      const webRsvpUrl = `${baseUrl}/rsvp`

      await sendEmail({
        to:      inv.email,
        subject: "You're Invited — Ekow & Ekua's Wedding 💒",
        html:    inviteWithRSVPEmail({
          name: inv.name,
          yesUrl,
          noUrl,
          qrDataUrl,
          webRsvpUrl,
          customMessage,
        }),
      })

      // Save token + sent timestamp
      await prisma.invitee.update({
        where: { id: inv.id },
        data: {
          rsvpToken:    token,
          inviteSentAt: new Date(),
        },
      })

      sent++
    } catch (e) {
      failed++
      errors.push(`${inv.name}: ${(e as Error).message}`)
    }
  }

  // Log in EmailLog
  try {
    await prisma.emailLog.create({
      data: {
        subject:    "Wedding Invitation — Ekow & Ekua",
        body:       customMessage ?? 'Standard invitation',
        recipients: JSON.stringify(invitees.map(i => i.email).filter(Boolean)),
        status:     failed === 0 ? 'sent' : `${sent}/${sent + failed}`,
      },
    })
  } catch { /* non-fatal */ }

  return NextResponse.json({ sent, failed, errors })
}
