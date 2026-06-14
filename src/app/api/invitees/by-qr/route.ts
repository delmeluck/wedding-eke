import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

  const invitee = await prisma.invitee.findUnique({
    where: { qrCode: code },
    include: { rsvp: true },
  })
  if (!invitee) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(invitee)
}
