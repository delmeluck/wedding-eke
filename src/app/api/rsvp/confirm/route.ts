import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

function confirmationEmail({
  name,
  attending,
  baseUrl,
}: {
  name: string
  attending: boolean
  baseUrl: string
}) {
  return attending
    ? `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F5F3FF;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px;">
<table width="560" cellpadding="0" cellspacing="0"
  style="max-width:560px;width:100%;border-radius:18px;overflow:hidden;box-shadow:0 4px 32px rgba(37,32,72,0.15);">
  <tr><td style="background:linear-gradient(135deg,#252048,#5B4E9A);padding:40px;text-align:center;">
    <p style="color:#E6E6FA;font-family:sans-serif;font-size:10px;letter-spacing:.4em;text-transform:uppercase;margin:0 0 10px;">RSVP Confirmed</p>
    <h1 style="color:#C9A84C;font-family:Georgia,serif;font-size:40px;font-style:italic;margin:0;">See You There! 🎉</h1>
  </td></tr>
  <tr><td style="background:#fef7ed;padding:40px;text-align:center;">
    <p style="font-size:20px;color:#3D3575;margin:0 0 14px;">Dear <em>${name}</em>,</p>
    <p style="color:#451a03;line-height:1.85;font-size:15px;margin:0 0 24px;">
      We are absolutely thrilled that you will be joining us! Your attendance has been confirmed.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#fff;border:1px solid #E6E6FA;border-radius:12px;margin:0 0 24px;">
      <tr><td style="padding:20px;text-align:center;">
        <p style="font-family:sans-serif;font-size:11px;color:#7B6DAF;letter-spacing:.3em;text-transform:uppercase;margin:0 0 8px;">What to Remember</p>
        <p style="font-family:sans-serif;font-size:13px;color:#5B4E9A;margin:0 0 6px;">💍 Engagement — 17 December 2026 · Kasoa</p>
        <p style="font-family:sans-serif;font-size:13px;color:#5B4E9A;margin:0 0 6px;">💒 Wedding — 19 December 2026 · Bethany Methodist Church, Dzorwulu, Accra</p>
        <p style="font-family:sans-serif;font-size:12px;color:#9B8DC8;margin:0;">🎨 Dress Code: Smart Formal / African Formal</p>
      </td></tr>
    </table>
    <a href="${baseUrl}/program"
      style="display:inline-block;background:#5B4E9A;color:#fff;font-family:sans-serif;font-size:14px;font-weight:600;text-decoration:none;padding:13px 30px;border-radius:50px;">
      View Full Program →
    </a>
  </td></tr>
  <tr><td style="background:#252048;padding:24px 40px;text-align:center;">
    <p style="color:#C9A84C;font-family:Georgia,serif;font-size:17px;font-style:italic;margin:0;">Ekow &amp; Ekua</p>
    <p style="color:#7B6DAF;font-family:sans-serif;font-size:11px;margin:8px 0 0;">19 December 2026 · Accra, Ghana</p>
  </td></tr>
</table></td></tr></table>
</body></html>`
    : `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F5F3FF;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px;">
<table width="560" cellpadding="0" cellspacing="0"
  style="max-width:560px;width:100%;border-radius:18px;overflow:hidden;box-shadow:0 4px 32px rgba(37,32,72,0.15);">
  <tr><td style="background:linear-gradient(135deg,#252048,#3D3575);padding:40px;text-align:center;">
    <p style="color:#E6E6FA;font-family:sans-serif;font-size:10px;letter-spacing:.4em;text-transform:uppercase;margin:0 0 10px;">RSVP Received</p>
    <h1 style="color:#D8BFD8;font-family:Georgia,serif;font-size:40px;font-style:italic;margin:0;">We'll Miss You 💌</h1>
  </td></tr>
  <tr><td style="background:#fef7ed;padding:40px;text-align:center;">
    <p style="font-size:20px;color:#3D3575;margin:0 0 14px;">Dear <em>${name}</em>,</p>
    <p style="color:#451a03;line-height:1.85;font-size:15px;margin:0 0 24px;">
      We're so sorry you won't be able to make it, but we truly appreciate you letting us know.
      You will be in our hearts and thoughts on our special day.
    </p>
    <p style="font-family:sans-serif;font-size:13px;color:#9B8DC8;">With all our love, Ekow &amp; Ekua 💜</p>
  </td></tr>
  <tr><td style="background:#252048;padding:24px 40px;text-align:center;">
    <p style="color:#C9A84C;font-family:Georgia,serif;font-size:17px;font-style:italic;margin:0;">Ekow &amp; Ekua</p>
    <p style="color:#7B6DAF;font-family:sans-serif;font-size:11px;margin:8px 0 0;">19 December 2026 · Accra, Ghana</p>
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

    // Send confirmation email
    if (invitee.email) {
      try {
        await sendEmail({
          to:      invitee.email,
          subject: attending
            ? '✓ RSVP Confirmed — Ekow & Ekua\'s Wedding'
            : 'RSVP Received — Ekow & Ekua',
          html: confirmationEmail({ name: invitee.name, attending, baseUrl }),
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
