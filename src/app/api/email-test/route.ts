import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { verifyEmailConfig, sendEmail } from '@/lib/email'

// GET  /api/email-test  — just verify config
// POST /api/email-test  — send a real test email to the admin

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await verifyEmailConfig()
  return NextResponse.json(result)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { to } = await req.json()
  if (!to) return NextResponse.json({ error: 'Missing "to" email' }, { status: 400 })

  try {
    await sendEmail({
      to,
      subject: '✅ E & E Wedding — Email Config Test',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
          <h2 style="color:#6b2568;">Email is working! 🎉</h2>
          <p>Your wedding site email configuration is set up correctly.</p>
          <p style="color:#aaa;font-size:12px;margin-top:24px;">
            Provider: ${process.env.EMAIL_PROVIDER ?? 'smtp'} ·
            From: ${process.env.EMAIL_FROM}
          </p>
        </div>
      `,
    })
    return NextResponse.json({ ok: true, message: `Test email sent to ${to}` })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 })
  }
}
