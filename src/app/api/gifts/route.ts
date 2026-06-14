import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const gifts = await prisma.gift.findMany({ orderBy: [{ priority: 'desc' }, { name: 'asc' }] })
  return NextResponse.json(gifts)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const gift = await prisma.gift.create({ data: body })
  return NextResponse.json(gift, { status: 201 })
}
