import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

function confirmationEmail({
  name,
  attending,
  baseUrl,
  venueCode,
}: {
  name: string
  attending: boolean
  baseUrl: string
  venueCode?: string
}) {
  const venueUrl = venueCode ? `${baseUrl}/venue?code=${venueCode}` : `${baseUrl}/venue`
  return attending
    ? `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F5F3FF;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px;">
<table width="560" cellpadding="0" cellspacing="0"
  style="max-width:560px;width:100%;border-radius:18px;overflow:hidden;box-shadow:0 4px 32px rgba(37,32,72,0.15);">
  <tr><td style="background:linear-gradient(135deg,#2a1540,#8F5DAF);padding:40px;text-align:center;">
    <p style="color:#E6E6FA;font-family:sans-serif;font-size:10px;letter-spacing:.4em;text-transform:uppercase;margin:0 0 10px;">RSVP Confirmed</p>
    <h1 style="color:#C9A227;font-family:Georgia,serif;font-size:40px;font-style:italic;margin:0;">See You There! 🎉</h1>
  </td></tr>
  <tr><td style="background:#fef7ed;padding:40px;text-align:center;">
    <p style="font-size:20px;color:#432b50;margin:0 0 14px;">Dear <em>${name}</em>,</p>
    <p style="color:#451a03;line-height:1.85;font-size:15px;margin:0 0 24px;">
      We are absolutely thrilled that you will be joining us! Your attendance has been confirmed.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#fff;border:1px solid #E6E6FA;border-radius:12px;margin:0 0 24px;">
      <tr><td style="padding:20px;text-align:center;">
        <p style="font-family:sans-serif;font-size:11px;color:#8F5DAF;letter-spacing:.3em;text-transform:uppercase;margin:0 0 8px;">What to Remember</p>
        <p style="font-family:sans-serif;font-size:13px;color:#8F5DAF;margin:0 0 6px;">💍 Engagement — 17 December 2026 · Kasoa</p>
        <p style="font-family:sans-serif;font-size:13px;color:#8F5DAF;margin:0 0 6px;">💒 Wedding — 19 December 2026 · Bethany Methodist Church, Dzorwulu, Accra</p>
        <p style="font-family:sans-serif;font-size:12px;color:#9B8DC8;margin:0;">🎨 Dress Code: Smart Formal / African Formal</p>
      </td></tr>
    </table>

    ${venueCode ? `
    <!-- Venue Access Code -->
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:linear-gradient(135deg,#2a1540,#432b50);border-radius:14px;margin:0 0 24px;">
      <tr><td style="padding:24px;text-align:center;">
        <p style="font-family:sans-serif;font-size:10px;color:#E6E6FA;letter-spacing:.4em;text-transform:uppercase;margin:0 0 8px;">🔐 Your Venue Access Code</p>
        <p style="font-family:Georgia,serif;font-size:32px;color:#C9A227;letter-spacing:.15em;margin:0 0 6px;font-weight:bold;">${venueCode}</p>
        <p style="font-family:sans-serif;font-size:11px;color:#BDB5D5;margin:0 0 16px;">Use this code to unlock venue locations &amp; directions</p>
        <a href="${venueUrl}"
          style="display:inline-block;background:#C9A227;color:#2a1540;font-family:sans-serif;font-size:13px;font-weight:700;text-decoration:none;padding:11px 26px;border-radius:50px;">
          View Venue &amp; Directions →
        </a>
      </td></tr>
    </table>` : ''}

    <a href="${venueCode ? `${baseUrl}/program?code=${venueCode}` : `${baseUrl}/program`}"
      style="display:inline-block;background:#8F5DAF;color:#fff;font-family:sans-serif;font-size:14px;font-weight:600;text-decoration:none;padding:13px 30px;border-radius:50px;">
      View Full Program →
    </a>
  </td></tr>
  <tr><td style="background:#2a1540;padding:24px 40px;text-align:center;">
    <p style="color:#C9A227;font-family:Georgia,serif;font-size:17px;font-style:italic;margin:0;">Ekow &amp; Ekua</p>
    <p style="color:#8F5DAF;font-family:sans-serif;font-size:11px;margin:8px 0 0;">19 December 2026 · Accra, Ghana</p>
  </td></tr>
</table></td></tr></table>
</body></html>`
    : `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F5F3FF;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px;">
<table width="560" cellpadding="0" cellspacing="0"
  style="max-width:560px;width:100%;border-radius:18px;overflow:hidden;box-shadow:0 4px 32px rgba(37,32,72,0.15);">
  <tr><td style="background:linear-gradient(135deg,#2a1540,#432b50);padding:40px;text-align:center;">
    <p style="color:#E6E6FA;font-family:sans-serif;font-size:10px;letter-spacing:.4em;text-transform:uppercase;margin:0 0 10px;">RSVP Received</p>
    <h1 style="color:#D8BFD8;font-family:Georgia,serif;font-size:40px;font-style:italic;margin:0;">We'll Miss You 💌</h1>
  </td></tr>
  <tr><td style="background:#fef7ed;padding:40px;text-align:center;">
    <p style="font-size:20px;color:#432b50;margin:0 0 14px;">Dear <em>${name}</em>,</p>
    <p style="color:#451a03;line-height:1.85;font-size:15px;margin:0 0 24px;">
      We're so sorry you won't be able to make it, but we truly appreciate you letting us know.
      You will be in our hearts and thoughts on our special day.
    </p>
    <p style="font-family:sans-serif;font-size:13px;color:#9B8DC8;">With all our love, Ekow &amp; Ekua 💜</p>
  </td></tr>
  <tr><td style="background:#2a1540;padding:24px 40px;text-align:center;">
    <p style="color:#C9A227;font-family:Georgia,serif;font-size:17px;font-style:italic;margin:0;">Ekow &amp; Ekua</p>
    <p style="color:#8F5DAF;font-family:sans-serif;font-size:11px;margin:8px 0 0;">19 December 2026 · Accra, Ghana</p>
  </td></tr>
</table></td></tr></table>
</body></html>`
}

// GET /api/rsvp/confirm?token=xxx&r=yes|no
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token    = searchParams.get('token')
  const response = searchParams.get('r')
  const baseUrl  = process.env.NEXTAUTH_URL ?? 'https://wedding-eke.vercel.app'

  if (!token || !['yes', 'no'].includes(response ?? '')) {
    return NextResponse.redirect(`${baseUrl}/rsvp/confirm?status=invalid`)
  }

  try {
    const invitee = await prisma.invitee.findUnique({
      where:   { rsvpToken: token },
      include: { rsvp: true },
    })

    if (!invitee) {
      return NextResponse.redirect(`${baseUrl}/rsvp/confirm?status=invalid`)
    }

    const attending = response === 'yes'

    // Upsert RSVP
    await prisma.rSVP.upsert({
      where:  { inviteeId: invitee.id },
      update: { attending },
      create: { inviteeId: invitee.id, attending, plusOne: false },
    })

    // Derive a short human-readable venue access code from the qrCode UUID
    // e.g. "a1b2c3d4-..." → "A1B2C3D4" — easy to type, unique per invitee
    const venueCode = attending
      ? invitee.qrCode.replace(/-/g, '').slice(0, 8).toUpperCase()
      : undefined

    // Send confirmation email
    if (invitee.email) {
      try {
        await sendEmail({
          to:      invitee.email,
          subject: attending
            ? '✓ RSVP Confirmed — Ekow & Ekua\'s Wedding'
            : 'RSVP Received — Ekow & Ekua',
          html: confirmationEmail({ name: invitee.name, attending, baseUrl, venueCode }),
        })
      } catch { /* non-fatal */ }
    }

    const name = encodeURIComponent(invitee.name)
    return NextResponse.redirect(
      `${baseUrl}/rsvp/confirm?status=${attending ? 'yes' : 'no'}&name=${name}`
    )
  } catch {
    return NextResponse.redirect(`${baseUrl}/rsvp/confirm?status=error`)
  }
}
