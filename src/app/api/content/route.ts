import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const content = await prisma.siteContent.findMany()
  return NextResponse.json(Object.fromEntries(content.map(c => [c.key, c.value])))
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: Record<string, string> = await req.json()
  const updates = await Promise.all(
    Object.entries(body).map(([key, value]) =>
      prisma.siteContent.upsert({
        where:  { key },
        create: { key, value },
        update: { value },
      })
    )
  )
  return NextResponse.json(updates)
}
