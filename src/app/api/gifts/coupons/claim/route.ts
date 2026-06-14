import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/gifts/coupons/claim  — public: guest claims a coupon by code
export async function POST(req: NextRequest) {
  const { code, name } = await req.json()
  if (!code || !name)
    return NextResponse.json({ error: 'code and name required' }, { status: 400 })

  const coupon = await prisma.giftCoupon.findUnique({ where: { code: code.trim().toUpperCase() } })
  if (!coupon) return NextResponse.json({ error: 'Invalid code' }, { status: 404 })
  if (coupon.claimedAt) return NextResponse.json({ error: 'Already claimed' }, { status: 409 })

  const updated = await prisma.giftCoupon.update({
    where: { id: coupon.id },
    data:  { claimedBy: name, claimedAt: new Date() },
    include: { gift: { select: { name: true, description: true } } },
  })
  return NextResponse.json(updated)
}

// GET /api/gifts/coupons/claim?code=XXX — check status (public)
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 })

  const coupon = await prisma.giftCoupon.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: { gift: { select: { name: true, description: true } } },
  })
  if (!coupon) return NextResponse.json({ error: 'Invalid code' }, { status: 404 })

  return NextResponse.json({
    code:      coupon.code,
    value:     coupon.value,
    gift:      coupon.gift,
    claimed:   !!coupon.claimedAt,
    claimedBy: coupon.claimedBy,
    note:      coupon.note,
  })
}
