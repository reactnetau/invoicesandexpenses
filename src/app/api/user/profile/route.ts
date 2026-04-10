import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { encrypt, decrypt } from '@/lib/crypto'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      email: true,
      currency: true,
      business_name: true,
      full_name: true,
      phone: true,
      address: true,
      abn: true,
      payid_encrypted: true,
    },
  })

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let payid: string | null = null
  if (user.payid_encrypted) {
    try { payid = decrypt(user.payid_encrypted) } catch { payid = null }
  }

  return NextResponse.json({
    email: user.email,
    currency: user.currency ?? 'USD',
    business_name: user.business_name,
    full_name: user.full_name,
    phone: user.phone,
    address: user.address,
    abn: user.abn,
    payid,
  })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { currency, business_name, full_name, phone, address, abn, payid } = body

  const data: Record<string, string | null> = {
    currency: currency?.trim() || 'USD',
    business_name: business_name?.trim() || null,
    full_name: full_name?.trim() || null,
    phone: phone?.trim() || null,
    address: address?.trim() || null,
    abn: abn?.trim() || null,
  }

  if (payid !== undefined) {
    data.payid_encrypted = payid?.trim() ? encrypt(payid.trim()) : null
  }

  try {
    await prisma.user.update({
      where: { id: session.userId },
      data,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[profile/save]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
