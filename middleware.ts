/**
 * Next.js Middleware
 * MVP: 기본 구조만 유지, 실제 인증 보호는 클라이언트 사이드 ProtectedRoute에서 처리
 * 
 * 참고: Next.js middleware는 서버 사이드에서 실행되므로 localStorage 접근 불가
 * MVP에서는 클라이언트 사이드 보호로 충분
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // MVP: 기본 통과, 실제 보호는 ProtectedRoute 컴포넌트에서 처리
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
