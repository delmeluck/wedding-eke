import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/gifts/momo — admin: list all MoMo payment records
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payments = await prisma.momoPayment.findMany({
    orderBy: { createdAt: 'desc' },
    include: { gift: { select: { name: true } } },
  })
  return NextResponse.json(payments)
}
