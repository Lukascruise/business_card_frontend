/**
 * Protected Route 컴포넌트
 * 클라이언트 사이드에서 추가 인증 체크 (서버 사이드 보완)
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/auth/login');
    }
  }, [router]);

  if (!auth.isAuthenticated()) {
    return null; // 리다이렉트 중
  }

  return <>{children}</>;
}
