import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const schema = z.object({
  name:        z.string().min(1),
  email:       z.string().email().optional().or(z.literal('')),
  phone:       z.string().optional(),
  plusOne:     z.boolean().optional().default(false),
  plusOneName: z.string().optional(),
  tableNumber: z.string().optional(),
  group:       z.string().optional(),
  notes:       z.string().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const invitees = await prisma.invitee.findMany({
    include: { rsvp: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(invitees)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data', issues: parsed.error.issues }, { status: 400 })

  const data = parsed.data
  const invitee = await prisma.invitee.create({
    data: {
      ...data,
      email:   data.email || undefined,
      qrCode:  uuidv4(),
    },
  })
  return NextResponse.json(invitee, { status: 201 })
}
