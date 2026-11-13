import { NextRequest, NextResponse } from 'next/server'

// POST /api/gifts/momo/submit-otp
export async function POST(req: NextRequest) {
  const { otp, reference } = await req.json()

  if (!otp || !reference) {
    return NextResponse.json({ error: 'otp and reference are required' }, { status: 400 })
  }

  const paystackKey = process.env.PAYSTACK_SECRET_KEY
  if (!paystackKey) {
    return NextResponse.json({ error: 'Payment provider not configured' }, { status: 503 })
  }

  try {
    const res = await fetch('https://api.paystack.co/charge/submit_otp', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ otp, reference }),
    })

    const data = await res.json()
    console.log('[MoMo/submit-otp] Paystack response:', JSON.stringify(data))

    if (!res.ok || data.status === false) {
      return NextResponse.json(
        { error: data.message ?? 'OTP submission failed' },
        { status: 422 },
      )
    }

    const status      = data.data?.status      ?? 'pending'
    const displayText = data.data?.display_text ?? ''

    return NextResponse.json({ status, displayText })
  } catch (err) {
    console.error('[MoMo/submit-otp] error:', err)
    return NextResponse.json({ error: 'Could not reach payment provider' }, { status: 502 })
  }
}
