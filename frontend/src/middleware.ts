import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get('is_logged_in')
  const { pathname } = request.nextUrl
 
  // Allow access to login page and static assets
  if (pathname === '/login' || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next()
  }
 
  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
 
  return NextResponse.next()
}
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
