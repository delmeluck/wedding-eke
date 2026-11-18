import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const media = await prisma.mediaItem.findMany({
    orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
  })
  return NextResponse.json(media)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const item = await prisma.mediaItem.create({ data: body })
  return NextResponse.json(item, { status: 201 })
}

// Batch reorder: PATCH /api/gallery  body: [{ id, sortOrder }]
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const updates: { id: string; sortOrder: number }[] = await req.json()
  await Promise.all(
    updates.map(u => prisma.mediaItem.update({ where: { id: u.id }, data: { sortOrder: u.sortOrder } }))
  )
  return NextResponse.json({ ok: true })
}
