import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateQRCodeDataURL, rsvpUrl } from '@/lib/qrcode'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const invitee = await prisma.invitee.findUnique({ where: { id } })
  if (!invitee) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const url     = rsvpUrl(invitee.qrCode)
  const dataUrl = await generateQRCodeDataURL(url)

  return NextResponse.json({ qrCode: dataUrl, url })
}
