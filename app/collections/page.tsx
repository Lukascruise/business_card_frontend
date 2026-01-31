'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

/**
 * 수집한 명함 목록 페이지
 * TODO: 수집 목록 조회 API 확인 필요 (현재 API 명세에 없음)
 */
export default function CollectionsPage() {
  return (
    <ProtectedRoute>
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>수집한 명함</h1>
        <div style={{ marginTop: '2rem', textAlign: 'center', padding: '3rem', color: '#666' }}>
          <p>수집한 명함 목록 조회 API가 필요합니다.</p>
          <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
            현재 API 명세서에 수집 목록 조회 엔드포인트가 없습니다.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
