import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let c = 'GIFT-EKE-'
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)]
  return c
}

// GET /api/gifts/coupons — list all coupons (admin)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const coupons = await prisma.giftCoupon.findMany({
    include: { gift: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(coupons)
}

// POST /api/gifts/coupons — generate N coupons for a gift
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { giftId, count = 1, value, note } = await req.json()
  if (!giftId) return NextResponse.json({ error: 'giftId required' }, { status: 400 })

  const coupons = await Promise.all(
    Array.from({ length: Math.min(Number(count), 50) }).map(() =>
      prisma.giftCoupon.create({
        data: { giftId, code: genCode(), value: value ? Number(value) : undefined, note },
      })
    )
  )
  return NextResponse.json(coupons, { status: 201 })
}
