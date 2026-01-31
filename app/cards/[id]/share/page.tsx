'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/constants';

/**
 * 명함 공유 설정 페이지
 * API: POST /v1/cards/:id/tokens, PATCH /v1/tokens/:id/deactivate
 */
interface ShareToken {
  id: string;
  share_token: string;
  expires_at: string;
  is_active: boolean;
}

export default function SharePage() {
  const router = useRouter();
  const params = useParams();
  const cardId = params.id as string;

  const [expiresAt, setExpiresAt] = useState('1'); // 1시간, 1일, 1주일
  const [shareLink, setShareLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateToken = async () => {
    setError('');
    setLoading(true);

    try {
      // 만료 시간 계산
      const now = new Date();
      let expiresDate = new Date();
      
      switch (expiresAt) {
        case '1':
          expiresDate.setHours(now.getHours() + 1);
          break;
        case '24':
          expiresDate.setHours(now.getHours() + 24);
          break;
        case '168':
          expiresDate.setHours(now.getHours() + 168);
          break;
        default:
          expiresDate.setHours(now.getHours() + 1);
      }

      const response = await api.post<{ share_token: string; expires_at: string }>(
        ENDPOINTS.CARD_TOKENS(cardId),
        { expires_at: expiresDate.toISOString() }
      );

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      setShareLink(`${baseUrl}/s/${response.share_token}`);
    } catch (err: any) {
      setError(err.message || '공유 링크 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      alert('링크가 복사되었습니다.');
    }
  };

  return (
    <ProtectedRoute>
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1rem' }}>
          <Link href={`/cards/${cardId}`} style={{ color: '#0070f3' }}>
            ← 명함으로
          </Link>
        </div>

        <h1>명함 공유</h1>

        <div style={{ marginTop: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label>
              만료 시간
              <select
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
              >
                <option value="1">1시간</option>
                <option value="24">1일</option>
                <option value="168">1주일</option>
              </select>
            </label>
          </div>

          <button
            onClick={handleCreateToken}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '1rem',
            }}
          >
            {loading ? '생성 중...' : '공유 링크 생성'}
          </button>

          {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

          {shareLink && (
            <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>공유 링크:</div>
              <div
                style={{
                  padding: '0.5rem',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  wordBreak: 'break-all',
                  marginBottom: '0.5rem',
                }}
              >
                {shareLink}
              </div>
              <button
                onClick={handleCopyLink}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                링크 복사
              </button>
            </div>
          )}
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.875rem', color: '#666' }}>
            <strong>참고:</strong> 생성된 링크는 설정한 시간 후 자동으로 만료됩니다.
            링크를 받은 사람은 명함을 조회하고 수집할 수 있습니다.
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
