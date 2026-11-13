import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Maps our network slug to Paystack's provider code
const NETWORK_MAP: Record<string, string> = {
  mtn:     'mtn',
  telecel: 'vod',  // Vodafone → Telecel Cash
  airtel:  'tgo',  // AirtelTigo
}

function makeRef(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `EKEW-${ts}-${rand}`
}

// POST /api/gifts/momo/initiate
export async function POST(req: NextRequest) {
  const { giftId, donorName, donorPhone, network, amount, note } = await req.json()

  if (!donorPhone || !network || !amount) {
    return NextResponse.json({ error: 'donorPhone, network, and amount are required' }, { status: 400 })
  }

  const amountNum = Number(amount)
  if (isNaN(amountNum) || amountNum < 1) {
    return NextResponse.json({ error: 'Amount must be at least GH₵ 1' }, { status: 400 })
  }

  const reference = makeRef()

  const paystackKey = process.env.PAYSTACK_SECRET_KEY

  // --- Paystack charge flow ---
  if (paystackKey) {
    const provider = NETWORK_MAP[network]
    if (!provider) return NextResponse.json({ error: 'Unknown network' }, { status: 400 })

    // Paystack requires an email — derive a pseudo-email from the phone number
    const email = `${donorPhone.replace(/\D/g, '')}@momo.ekeandekua.com`

    let paystackStatus = 'pending'
    let displayText    = 'Please check your phone to approve the payment.'
    let paystackRef    = reference

    try {
      const psRes = await fetch('https://api.paystack.co/charge', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount:      Math.round(amountNum * 100), // pesewas
          currency:    'GHS',
          reference,
          mobile_money: { phone: donorPhone, provider },
          metadata: {
            giftId:    giftId ?? null,
            donorName: donorName ?? null,
            note:      note ?? null,
          },
        }),
      })

      const psData = await psRes.json()
      console.log('[MoMo/initiate] Paystack response:', JSON.stringify(psData))

      if (!psRes.ok || psData.status === false) {
        return NextResponse.json(
          { error: psData.message ?? 'Payment initiation failed' },
          { status: 422 },
        )
      }

      paystackStatus = psData.data?.status      ?? 'pending'
      displayText    = psData.data?.display_text ?? displayText
      paystackRef    = psData.data?.reference    ?? reference

    } catch (err) {
      console.error('[MoMo/initiate] Paystack fetch error:', err)
      return NextResponse.json({ error: 'Could not reach payment provider' }, { status: 502 })
    }

    // Record in DB
    const payment = await prisma.momoPayment.create({
      data: {
        giftId:     giftId ?? undefined,
        donorName:  donorName ?? undefined,
        donorPhone,
        network,
        amount:     amountNum,
        reference,
        paystackRef,
        status:     paystackStatus === 'success' ? 'success' : 'pending',
        displayText,
        note:       note ?? undefined,
        confirmedAt: paystackStatus === 'success' ? new Date() : undefined,
      },
    })

    // send_otp → Paystack needs the user to enter an SMS code before polling
    if (paystackStatus === 'send_otp') {
      return NextResponse.json({
        reference: payment.reference,
        status:    'send_otp',
        displayText: psData.data?.display_text ?? 'Enter the code sent to your phone.',
        mode: 'paystack',
      })
    }

    return NextResponse.json({
      reference: payment.reference,
      status:    payment.status,
      displayText,
      mode: 'paystack',
    })
  }

  // --- Manual / no-Paystack fallback ---
  // Just log the intent; guest confirms via USSD on their own phone
  const payment = await prisma.momoPayment.create({
    data: {
      giftId:    giftId ?? undefined,
      donorName: donorName ?? undefined,
      donorPhone,
      network,
      amount:    amountNum,
      reference,
      status:    'pending',
      displayText: "Please complete the transfer on your phone, then tap \"I've sent the gift\" below.",
      note:      note ?? undefined,
    },
  })

  return NextResponse.json({
    reference: payment.reference,
    status:    'pending',
    displayText: payment.displayText,
    mode: 'manual',
  })
}
