import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const invitee = await prisma.invitee.findUnique({
    where: { id: params.id },
    include: { rsvp: true },
  })
  if (!invitee) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(invitee)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const invitee = await prisma.invitee.update({
    where: { id: params.id },
    data:  body,
  })
  return NextResponse.json(invitee)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.invitee.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
