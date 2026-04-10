import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { encrypt, decrypt } from '@/lib/crypto'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { payid_encrypted: true },
  })

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let payid: string | null = null
  if (user.payid_encrypted) {
    try {
      payid = decrypt(user.payid_encrypted)
    } catch {
      payid = null
    }
  }

  return NextResponse.json({ payid })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { payid } = await req.json()

  if (typeof payid !== 'string' || payid.trim().length === 0) {
    return NextResponse.json({ error: 'payid is required' }, { status: 400 })
  }

  const encrypted = encrypt(payid.trim())

  await prisma.user.update({
    where: { id: session.userId },
    data: { payid_encrypted: encrypted },
  })

  return NextResponse.json({ ok: true })
}
