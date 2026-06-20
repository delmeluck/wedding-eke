import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

function couponEmailTemplate(opts: {
  recipientName: string
  giftName: string
  code: string
  value?: number | null
  note?: string | null
  claimUrl: string
}) {
  return `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8f0f8;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px;">
<table width="560" cellpadding="0" cellspacing="0"
  style="max-width:560px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 40px rgba(53,11,54,.18);">

  <tr><td style="background:linear-gradient(135deg,#252048,#5B4E9A);padding:40px;text-align:center;">
    <p style="color:#D8BFD8;font-family:sans-serif;font-size:11px;letter-spacing:.35em;text-transform:uppercase;margin:0 0 10px;">Ekow &amp; Ekua Wedding</p>
    <h1 style="color:#C9A84C;font-size:42px;margin:0;font-style:italic;">🎁 Gift Token</h1>
    <p style="color:#C3B1E1;font-size:16px;margin:10px 0 0;font-style:italic;">A special gift just for you</p>
  </td></tr>

  <tr><td style="background:#fef7ed;padding:36px 40px;">
    <p style="font-size:20px;color:#3D3575;text-align:center;margin:0 0 12px;">Dear <em>${opts.recipientName}</em>,</p>
    <p style="color:#451a03;line-height:1.8;text-align:center;font-size:14px;margin:0 0 28px;">
      As a token of appreciation, we've created a personal gift for you${opts.value ? ` worth <strong>GH₵ ${opts.value.toLocaleString()}</strong>` : ''} towards <strong>${opts.giftName}</strong>.
    </p>
    ${opts.note ? `<p style="color:#5B4E9A;text-align:center;font-style:italic;margin:0 0 24px;">"${opts.note}"</p>` : ''}

    <!-- Code box -->
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#fff;border:2px dashed #C9A84C;border-radius:12px;margin:0 0 28px;">
      <tr><td style="padding:24px;text-align:center;">
        <p style="font-family:sans-serif;font-size:11px;color:#7B6DAF;letter-spacing:.3em;text-transform:uppercase;margin:0 0 8px;">Your Unique Gift Code</p>
        <p style="font-family:monospace;font-size:28px;font-weight:bold;color:#252048;letter-spacing:.15em;margin:0;">${opts.code}</p>
        ${opts.value ? `<p style="color:#C9A84C;font-weight:bold;font-size:18px;margin:8px 0 0;">GH₵ ${opts.value.toLocaleString()}</p>` : ''}
      </td></tr>
    </table>

    <!-- CTA -->
    <div style="text-align:center;margin:0 0 20px;">
      <a href="${opts.claimUrl}" style="display:inline-block;background:#5B4E9A;color:#fff;font-family:sans-serif;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:50px;">
        Claim Your Gift →
      </a>
    </div>
    <p style="font-family:sans-serif;font-size:12px;color:#aaa;text-align:center;margin:0;">
      Or visit: ${opts.claimUrl}
    </p>
  </td></tr>

  <tr><td style="background:#252048;padding:24px 40px;text-align:center;">
    <p style="color:#C9A84C;font-family:Georgia,serif;font-size:16px;font-style:italic;margin:0;">With love, Ekow &amp; Ekua</p>
    <p style="color:#7B6DAF;font-family:sans-serif;font-size:11px;margin:8px 0 0;">19 December 2026 · Accra, Ghana</p>
  </td></tr>

</table></td></tr></table>
</body></html>`
}

// POST /api/gifts/coupons/send — send a coupon code to a guest email
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { couponId, email, recipientName } = await req.json()
  if (!couponId || !email || !recipientName)
    return NextResponse.json({ error: 'couponId, email and recipientName required' }, { status: 400 })

  const coupon = await prisma.giftCoupon.findUnique({
    where: { id: couponId },
    include: { gift: true },
  })
  if (!coupon) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://wedding-eke.vercel.app'
  const claimUrl = `${baseUrl}/gifts/claim?code=${coupon.code}`

  await sendEmail({
    to:      email,
    subject: `Your Gift Token from Ekow & Ekua's Wedding 🎁`,
    html:    couponEmailTemplate({
      recipientName,
      giftName: coupon.gift.name,
      code:     coupon.code,
      value:    coupon.value,
      note:     coupon.note,
      claimUrl,
    }),
  })

  await prisma.giftCoupon.update({
    where: { id: couponId },
    data:  { sentTo: email, sentAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}
