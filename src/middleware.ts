import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const PROTECTED = ['/dashboard', '/invoices', '/expenses', '/clients', '/settings']
const AUTH_ONLY = ['/login', '/signup']

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? '')
}

async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get('token')?.value
  if (!token) return false
  try {
    await jwtVerify(token, getSecret())
    return true
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const authed = await isAuthenticated(req)

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  const isAuthPage = AUTH_ONLY.some((p) => pathname === p)

  if (isProtected && !authed) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAuthPage && authed) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/invoices/:path*', '/expenses/:path*', '/clients/:path*', '/settings/:path*', '/login', '/signup'],
}
