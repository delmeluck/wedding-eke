import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'iotchere55@gmail.com'

function giftConfirmHtml(p: { donorName?: string | null; amount: number; network: string; donorPhone?: string | null; reference: string }) {
  const name = p.donorName ?? 'Your guest'
  return `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#fff;">
  <h2 style="color:#8F5DAF;margin:0 0 4px;">Gift Received 🎉</h2>
  <p style="color:#555;margin:0 0 20px;font-size:14px;">E &amp; E Wedding</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:8px 0;color:#888;width:140px;">From</td><td style="padding:8px 0;color:#222;font-weight:600;">${name}</td></tr>
    <tr><td style="padding:8px 0;color:#888;">Amount</td><td style="padding:8px 0;color:#222;font-weight:600;">GH₵ ${p.amount.toLocaleString()}</td></tr>
    <tr><td style="padding:8px 0;color:#888;">Network</td><td style="padding:8px 0;color:#222;">${p.network.toUpperCase()} MoMo</td></tr>
    <tr><td style="padding:8px 0;color:#888;">Phone</td><td style="padding:8px 0;color:#222;">${p.donorPhone}</td></tr>
    <tr><td style="padding:8px 0;color:#888;">Reference</td><td style="padding:8px 0;color:#222;font-family:monospace;font-size:12px;">${p.reference}</td></tr>
  </table>
  <p style="color:#C9A227;font-family:Georgia,serif;font-style:italic;font-size:18px;margin:24px 0 0;">With love, Ekow &amp; Ekua</p>
</div>`
}

function guestThankYouHtml(p: { donorName?: string | null; amount: number }) {
  const name = p.donorName ? `, ${p.donorName}` : ''
  return `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#fff;">
  <h2 style="color:#8F5DAF;margin:0 0 4px;">Thank You${name}! 🎉</h2>
  <p style="color:#555;line-height:1.7;margin:0 0 16px;">Your gift of <strong>GH₵ ${p.amount.toLocaleString()}</strong> via Mobile Money has been received. Ekow &amp; Ekua are truly grateful for your love and generosity.</p>
  <p style="color:#C9A227;font-family:Georgia,serif;font-style:italic;font-size:18px;margin:0;">With love, Ekow &amp; Ekua 💛</p>
</div>`
}

// GET /api/gifts/momo/verify?ref=EKEW-...
export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref')
  if (!ref) return NextResponse.json({ error: 'ref is required' }, { status: 400 })

  const payment = await prisma.momoPayment.findUnique({ where: { reference: ref } })
  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

  // Already resolved — return immediately
  if (payment.status === 'success' || payment.status === 'failed') {
    return NextResponse.json({ status: payment.status, displayText: payment.displayText })
  }

  // If Paystack is configured, fetch live status
  const paystackKey = process.env.PAYSTACK_SECRET_KEY
  if (paystackKey && payment.paystackRef) {
    try {
      const psRes  = await fetch(`https://api.paystack.co/charge/${payment.paystackRef}`, {
        headers: { Authorization: `Bearer ${paystackKey}` },
        cache: 'no-store',
      })
      const psData = await psRes.json()
      const psStatus = psData.data?.status as string | undefined

      let resolved = false
      let newStatus: string = payment.status

      if (psStatus === 'success') {
        newStatus = 'success'; resolved = true
      } else if (psStatus === 'failed') {
        newStatus = 'failed';  resolved = true
      }

      if (resolved) {
        await prisma.momoPayment.update({
          where: { reference: ref },
          data: {
            status:      newStatus,
            confirmedAt: newStatus === 'success' ? new Date() : undefined,
          },
        })
        return NextResponse.json({ status: newStatus, displayText: psData.data?.display_text ?? payment.displayText })
      }

      return NextResponse.json({ status: 'pending', displayText: psData.data?.display_text ?? payment.displayText })
    } catch {
      // Paystack unreachable — return DB state
    }
  }

  return NextResponse.json({ status: payment.status, displayText: payment.displayText })
}

// PATCH /api/gifts/momo/verify — guest self-confirms a manual transfer
export async function PATCH(req: NextRequest) {
  const { ref } = await req.json()
  if (!ref) return NextResponse.json({ error: 'ref required' }, { status: 400 })

  const payment = await prisma.momoPayment.findUnique({ where: { reference: ref } })
  if (!payment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.momoPayment.update({
    where: { reference: ref },
    data:  { status: 'success', confirmedAt: new Date() },
  })

  // Send confirmation emails (best-effort)
  try {
    const to = [ADMIN_EMAIL]
    if (payment.donorEmail) to.push(payment.donorEmail)
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `Gift received: GH₵${payment.amount} from ${payment.donorName ?? payment.donorPhone}`,
      html: giftConfirmHtml(payment),
    })
    if (payment.donorEmail) {
      await sendEmail({
        to: payment.donorEmail,
        subject: 'Your gift to Ekow & Ekua — Thank you! 🎉',
        html: guestThankYouHtml(payment),
      })
    }
  } catch (e) {
    console.error('[verify/PATCH] email error:', e)
  }

  return NextResponse.json({ status: updated.status })
}
