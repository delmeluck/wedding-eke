import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const venues = await prisma.venue.findMany({ orderBy: { eventDate: 'asc' } })
  return NextResponse.json(venues)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const venue = await prisma.venue.create({ data: body })
  return NextResponse.json(venue, { status: 201 })
}
