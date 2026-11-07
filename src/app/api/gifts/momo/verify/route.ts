import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
  return NextResponse.json({ status: updated.status })
}
