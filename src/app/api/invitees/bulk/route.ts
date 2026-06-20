import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

interface BulkRow {
  name: string
  email?: string
  phone?: string
  group?: string
  tableNumber?: string
  plusOne?: boolean
  notes?: string
}

// POST /api/invitees/bulk  { rows: BulkRow[] }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { rows } = await req.json() as { rows: BulkRow[] }
  if (!Array.isArray(rows) || rows.length === 0)
    return NextResponse.json({ error: 'No rows provided' }, { status: 400 })
  if (rows.length > 500)
    return NextResponse.json({ error: 'Maximum 500 rows per import' }, { status: 400 })

  let created = 0
  let skipped = 0
  const errors: string[] = []

  for (const row of rows) {
    const name = row.name?.trim()
    if (!name) { skipped++; continue }

    try {
      await prisma.invitee.create({
        data: {
          name,
          email:       row.email?.trim()       || undefined,
          phone:       row.phone?.trim()        || undefined,
          group:       row.group?.trim()        || undefined,
          tableNumber: row.tableNumber?.trim()  || undefined,
          plusOne:     Boolean(row.plusOne),
          notes:       row.notes?.trim()        || undefined,
          qrCode:      uuidv4(),
        },
      })
      created++
    } catch (e) {
      errors.push(`"${name}": ${(e as Error).message}`)
      skipped++
    }
  }

  return NextResponse.json({ created, skipped, errors })
}
