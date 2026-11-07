import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

// POST /api/invitees/[id]/send-code
// Sends the venue access code to a confirmed RSVP guest
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const invitee = await prisma.invitee.findUnique({
    where:   { id },
    include: { rsvp: true },
  })

  if (!invitee)
    return NextResponse.json({ error: 'Invitee not found' }, { status: 404 })
  if (!invitee.email)
    return NextResponse.json({ error: 'Invitee has no email address' }, { status: 400 })
  if (!invitee.rsvp?.attending)
    return NextResponse.json({ error: 'Guest has not confirmed attendance' }, { status: 400 })

  const baseUrl   = process.env.NEXTAUTH_URL ?? 'https://wedding-eke.vercel.app'
  const venueCode = invitee.qrCode.replace(/-/g, '').slice(0, 8).toUpperCase()
  const venueUrl  = `${baseUrl}/venue?code=${venueCode}`
  const programUrl = `${baseUrl}/program?code=${venueCode}`
  const streamUrl = `${baseUrl}/gallery?code=${venueCode}`

  try {
    await sendEmail({
      to:      invitee.email,
      subject: "🔐 Your Venue Access Code — Ekow & Ekua's Wedding",
      html: `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F5F3FF;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px;">
<table width="560" cellpadding="0" cellspacing="0"
  style="max-width:560px;width:100%;border-radius:18px;overflow:hidden;box-shadow:0 4px 32px rgba(37,32,72,0.15);">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#2a1540,#8F5DAF);padding:40px;text-align:center;">
    <p style="color:#E6E6FA;font-family:sans-serif;font-size:10px;letter-spacing:.4em;text-transform:uppercase;margin:0 0 10px;">Confirmed Guest Access</p>
    <h1 style="color:#C9A227;font-family:Georgia,serif;font-size:36px;font-style:italic;margin:0;">Your Access Code</h1>
    <p style="color:#D8BFD8;font-family:sans-serif;font-size:13px;margin:10px 0 0;">Ekow &amp; Ekua's Wedding · December 2026</p>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#fef7ed;padding:40px;text-align:center;">
    <p style="font-size:20px;color:#432b50;margin:0 0 14px;">Dear <em>${invitee.name}</em>,</p>
    <p style="color:#451a03;line-height:1.85;font-size:15px;margin:0 0 28px;">
      Here is your personal access code for venue directions and exclusive guest content.
    </p>

    <!-- Code box -->
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:linear-gradient(135deg,#2a1540,#432b50);border-radius:14px;margin:0 0 28px;">
      <tr><td style="padding:28px;text-align:center;">
        <p style="font-family:sans-serif;font-size:10px;color:#E6E6FA;letter-spacing:.4em;text-transform:uppercase;margin:0 0 10px;">🔐 Your Personal Code</p>
        <p style="font-family:Georgia,serif;font-size:36px;color:#C9A227;letter-spacing:.2em;margin:0 0 8px;font-weight:bold;">${venueCode}</p>
        <p style="font-family:sans-serif;font-size:11px;color:#BDB5D5;margin:0;">Keep this private — it's unique to you</p>
      </td></tr>
    </table>

    <!-- Action buttons -->
    <p style="font-family:sans-serif;font-size:12px;color:#8F5DAF;margin:0 0 16px;">Use your code to access:</p>
    <table align="center" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="padding:0 6px;">
          <a href="${venueUrl}" style="display:inline-block;background:#C9A227;color:#2a1540;font-family:sans-serif;font-size:13px;font-weight:700;text-decoration:none;padding:11px 20px;border-radius:50px;">
            📍 Venue &amp; Directions
          </a>
        </td>
        <td style="padding:0 6px;">
          <a href="${programUrl}" style="display:inline-block;background:#8F5DAF;color:#fff;font-family:sans-serif;font-size:13px;font-weight:600;text-decoration:none;padding:11px 20px;border-radius:50px;">
            📋 Full Program
          </a>
        </td>
        <td style="padding:0 6px;">
          <a href="${streamUrl}" style="display:inline-block;background:#fff;color:#8F5DAF;border:2px solid #BDB5D5;font-family:sans-serif;font-size:13px;font-weight:600;text-decoration:none;padding:10px 20px;border-radius:50px;">
            📺 Live Stream
          </a>
        </td>
      </tr>
    </table>

    <p style="font-family:sans-serif;font-size:12px;color:#9B8DC8;">
      Or enter the code manually on any page of the wedding site.
    </p>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#2a1540;padding:24px 40px;text-align:center;">
    <p style="color:#C9A227;font-family:Georgia,serif;font-size:17px;font-style:italic;margin:0;">Ekow &amp; Ekua</p>
    <p style="color:#8F5DAF;font-family:sans-serif;font-size:11px;margin:8px 0 0;">19 December 2026 · Accra, Ghana</p>
  </td></tr>

</table></td></tr></table>
</body></html>
      `,
    })

    return NextResponse.json({ ok: true, code: venueCode, sentTo: invitee.email })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 })
  }
}
