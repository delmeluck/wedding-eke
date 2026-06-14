import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  inviteeId:  z.string(),
  attending:  z.enum(['yes', 'no']),
  plusOne:    z.boolean().optional().default(false),
  dietaryReq: z.string().optional(),
  message:    z.string().optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

  const { inviteeId, attending, plusOne, dietaryReq, message } = parsed.data

  const rsvp = await prisma.rSVP.upsert({
    where:  { inviteeId },
    create: { inviteeId, attending: attending === 'yes', plusOne: plusOne ?? false, dietaryReq, message },
    update: { attending: attending === 'yes', plusOne: plusOne ?? false, dietaryReq, message },
  })

  return NextResponse.json(rsvp)
}
