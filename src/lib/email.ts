import nodemailer from 'nodemailer'

/* ─────────────────────────────────────────────────────────
   Email transport
   Supports two modes (set EMAIL_PROVIDER in .env.local):

   1. SMTP  (default)  — any SMTP server, Gmail, etc.
      EMAIL_SERVER_HOST / PORT / USER / PASSWORD / FROM

   2. Resend (recommended for Vercel / production)
      npm install resend
      RESEND_API_KEY=re_xxxxx
      EMAIL_FROM="E & E Wedding <noreply@yourdomain.com>"
───────────────────────────────────────────────────────── */

const provider = process.env.EMAIL_PROVIDER ?? 'smtp'

/* ── SMTP transport (lazy — only validated on first send) */
function createSMTPTransport() {
  const host = process.env.EMAIL_SERVER_HOST
  const user = process.env.EMAIL_SERVER_USER
  const pass = process.env.EMAIL_SERVER_PASSWORD
  const port = Number(process.env.EMAIL_SERVER_PORT ?? 587)

  if (!host || !user || !pass) {
    throw new Error(
      'SMTP not configured. Set EMAIL_SERVER_HOST, EMAIL_SERVER_USER, ' +
      'and EMAIL_SERVER_PASSWORD in your .env.local file.\n' +
      'For Gmail: create an App Password at myaccount.google.com/apppasswords'
    )
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  })
}

/* ── Core send function ─────────────────────────────────── */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[]
  subject: string
  html: string
  text?: string
}) {
  const from = process.env.EMAIL_FROM ?? 'E & E Wedding <noreply@wedding.com>'
  const recipients = Array.isArray(to) ? to : [to]
  const plainText = text ?? html.replace(/<[^>]+>/g, '')

  if (provider === 'resend') {
    /* ── Resend provider ───────────────────────────────── */
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) throw new Error('RESEND_API_KEY is not set in .env.local')

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject,
        html,
        text: plainText,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(`Resend API error ${res.status}: ${JSON.stringify(err)}`)
    }
  } else {
    /* ── SMTP / nodemailer ─────────────────────────────── */
    const transport = createSMTPTransport()
    await transport.sendMail({
      from,
      to: recipients.join(', '),
      subject,
      html,
      text: plainText,
    })
  }
}

/* ── Verify connection (call from admin / health-check) ── */
export async function verifyEmailConfig(): Promise<{ ok: boolean; message: string }> {
  try {
    if (provider === 'resend') {
      const apiKey = process.env.RESEND_API_KEY
      if (!apiKey) return { ok: false, message: 'RESEND_API_KEY not set' }
      // Quick ping to Resend domains endpoint
      const res = await fetch('https://api.resend.com/domains', {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      return res.ok
        ? { ok: true, message: 'Resend API key is valid' }
        : { ok: false, message: `Resend returned ${res.status}` }
    } else {
      const t = createSMTPTransport()
      await (t as nodemailer.Transporter).verify()
      return { ok: true, message: `SMTP connected to ${process.env.EMAIL_SERVER_HOST}` }
    }
  } catch (e: unknown) {
    return { ok: false, message: (e as Error).message }
  }
}

/* ── Admin magic-link email ─────────────────────────────── */
export async function sendMagicLink({
  identifier,
  url,
}: {
  identifier: string
  url: string
}) {
  await sendEmail({
    to: identifier,
    subject: 'Sign in to E & E Wedding Admin',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#fff;">
        <div style="text-align:center;margin-bottom:28px;">
          <h2 style="color:#6b2568;font-size:28px;margin:0;">E &amp; E Wedding</h2>
          <p style="color:#9e409b;font-size:13px;margin:4px 0 0;">Admin Portal</p>
        </div>
        <p style="color:#451a03;line-height:1.7;">Click the button below to sign in to the admin dashboard. This link expires in 24 hours.</p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${url}"
             style="display:inline-block;background:#6b2568;color:#fff;text-align:center;
                    padding:14px 32px;border-radius:50px;text-decoration:none;
                    font-family:sans-serif;font-size:15px;font-weight:600;">
            Sign In to Admin
          </a>
        </div>
        <p style="color:#aaa;font-size:12px;text-align:center;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}

/* ── Wedding invitation email template ──────────────────── */
export function inviteeEmailTemplate({
  name,
  qrCodeDataUrl,
  message,
  weddingDate,
  venue,
  mapLink,
  rsvpLink,
}: {
  name: string
  qrCodeDataUrl: string
  message?: string
  weddingDate: string
  venue: string
  mapLink?: string
  rsvpLink?: string
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wedding Invitation — Ekow &amp; Ekua</title>
</head>
<body style="margin:0;padding:0;background:#f8f0f8;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;
                      box-shadow:0 4px 40px rgba(53,11,54,0.18);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#350b36,#4f1750,#6b2568,#7c3020);
                       padding:52px 40px;text-align:center;">
              <p style="color:#cca0cc;font-family:sans-serif;font-size:11px;
                        letter-spacing:0.35em;text-transform:uppercase;margin:0 0 12px;">
                You are cordially invited
              </p>
              <h1 style="color:#C9A84C;font-family:Georgia,serif;font-size:52px;
                         margin:0;font-style:italic;line-height:1.1;">
                E &amp; E
              </h1>
              <p style="color:#e0aede;font-family:Georgia,serif;font-size:20px;
                        margin:10px 0 0;font-style:italic;">
                Ekow &amp; Ekua
              </p>
              <!-- Gold divider -->
              <div style="margin:20px auto;max-width:160px;height:1px;
                          background:linear-gradient(90deg,transparent,#C9A84C,transparent);"></div>
              <p style="color:#cca0cc;font-family:sans-serif;font-size:11px;
                        letter-spacing:0.3em;text-transform:uppercase;margin:0;">
                Wedding Invitation
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#fef7ed;padding:44px 40px;">

              <!-- Dear name -->
              <p style="font-size:22px;color:#4f1750;text-align:center;margin:0 0 16px;">
                Dear <em>${name}</em>,
              </p>

              <!-- Message -->
              <p style="color:#451a03;line-height:1.85;text-align:center;
                        font-size:15px;margin:0 0 32px;max-width:440px;margin-left:auto;margin-right:auto;">
                ${message ?? 'Together with their families, Ekow and Ekua joyfully request the honour of your presence as they exchange their vows and begin their journey as one.'}
              </p>

              <!-- Date & Venue box -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                     style="background:#fff;border:1px solid #e0c4e0;border-radius:12px;
                            margin:0 0 32px;">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <p style="font-family:sans-serif;font-size:11px;color:#9e409b;
                               letter-spacing:0.3em;text-transform:uppercase;margin:0 0 8px;">
                      Save the Date
                    </p>
                    <p style="font-size:22px;color:#350b36;margin:0 0 4px;font-weight:bold;">
                      ${weddingDate}
                    </p>
                    <p style="color:#6b2568;font-size:15px;margin:0;">
                      📍 ${venue}
                    </p>
                    ${mapLink ? `
                    <div style="margin-top:14px;">
                      <a href="${mapLink}"
                         style="display:inline-block;color:#6b2568;font-family:sans-serif;
                                font-size:13px;text-decoration:none;border:1px solid #6b2568;
                                padding:8px 18px;border-radius:50px;">
                        Get Directions →
                      </a>
                    </div>` : ''}
                  </td>
                </tr>
              </table>

              <!-- QR Code -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="text-align:center;padding:0 0 8px;">
                    <p style="font-family:sans-serif;font-size:13px;color:#6b2568;
                               font-weight:600;margin:0 0 4px;">
                      Your Personal QR Code
                    </p>
                    <p style="font-family:sans-serif;font-size:12px;color:#9e409b;
                               margin:0 0 16px;">
                      Present this at the venue for check-in
                    </p>
                    <img src="${qrCodeDataUrl}"
                         alt="Your QR Code for check-in"
                         width="180" height="180"
                         style="border:3px solid #6b2568;border-radius:12px;
                                display:block;margin:0 auto;" />
                  </td>
                </tr>
              </table>

              <!-- RSVP Button -->
              ${rsvpLink ? `
              <div style="text-align:center;margin:32px 0 0;">
                <a href="${rsvpLink}"
                   style="display:inline-block;background:#6b2568;color:#fff;
                          font-family:sans-serif;font-size:15px;font-weight:600;
                          text-decoration:none;padding:14px 36px;border-radius:50px;">
                  Confirm Attendance →
                </a>
                <p style="font-family:sans-serif;font-size:12px;color:#aaa;margin:10px 0 0;">
                  Please RSVP by 1 November 2026
                </p>
              </div>` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#350b36;padding:28px 40px;text-align:center;">
              <p style="color:#cca0cc;font-family:Georgia,serif;font-style:italic;
                        font-size:15px;margin:0 0 6px;">
                With love &amp; joy,
              </p>
              <p style="color:#C9A84C;font-family:Georgia,serif;font-size:18px;
                        font-style:italic;margin:0;">
                Ekow &amp; Ekua
              </p>
              <p style="color:#9e409b;font-family:sans-serif;font-size:11px;
                        margin:12px 0 0;">
                19 December 2026 · Bethany Methodist Church, Dzorwulu, Accra
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}
