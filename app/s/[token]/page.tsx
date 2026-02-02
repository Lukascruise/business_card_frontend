'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { API_KEYS, ENDPOINTS } from '@/lib/constants';

/**
 * 공유 링크 조회 페이지 (비로그인 사용자 접근 가능)
 * API: GET /v1/s/:token, POST /v1/collections
 * 백엔드가 flat 또는 nested(data 안에 필드) 형태로 올 수 있으므로 flatten 후 사용
 */
interface SharedCard {
  card_id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  bio?: string;
}

/** 백엔드 raw 응답: flat 또는 { card_id, data?: { name, ... } } */
type SharedCardRaw =
  | SharedCard
  | { card_id: string; data?: { name?: string; company?: string; email?: string; phone?: string; bio?: string } };

function flattenSharedCard(res: SharedCardRaw): SharedCard {
  if ('data' in res && res.data && typeof res.data === 'object') {
    const d = res.data;
    return {
      card_id: res.card_id,
      name: d.name ?? '',
      company: d.company,
      email: d.email,
      phone: d.phone,
      bio: d.bio,
    };
  }
  const flat = res as SharedCard;
  return {
    card_id: flat.card_id,
    name: flat.name ?? '',
    company: flat.company,
    email: flat.email,
    phone: flat.phone,
    bio: flat.bio,
  };
}

export default function SharedCardPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [card, setCard] = useState<SharedCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSharedCard();
  }, [token]);

  const fetchSharedCard = async () => {
    try {
      const res = await api.get<SharedCardRaw>(
        ENDPOINTS.SHARED_CARD(token),
        { requireAuth: false }
      );
      setCard(flattenSharedCard(res));
    } catch (err: any) {
      setError(err.message || '명함을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCollect = async () => {
    if (!card) return;

    // 로그인 체크
    if (!auth.isAuthenticated()) {
      router.push(`/auth/login?redirect=/s/${token}`);
      return;
    }

    setSaving(true);
    try {
      await api.post(ENDPOINTS.COLLECTIONS, {
        [API_KEYS.CARD_ID]: card.card_id,
      });
      alert('명함이 수집되었습니다.');
      router.push('/collections');
    } catch (err: any) {
      alert(err.message || '명함 수집에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>로딩 중...</div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ color: 'red', textAlign: 'center' }}>
          {error || '명함을 찾을 수 없습니다.'}
        </div>
        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem', color: '#666' }}>
          링크가 만료되었거나 잘못된 링크일 수 있습니다.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>공유 명함</h1>

      <div
        style={{
          padding: '2rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#fafafa',
        }}
      >
        <h2 style={{ marginBottom: '1.5rem' }}>{card.name || '이름 없음'}</h2>

        <div style={{ lineHeight: '1.8' }}>
          {card.company && <div><strong>회사:</strong> {card.company}</div>}
          {card.email && <div><strong>이메일:</strong> {card.email}</div>}
          {card.phone && <div><strong>전화번호:</strong> {card.phone}</div>}
          {card.bio && (
            <div style={{ marginTop: '1rem' }}>
              <strong>소개:</strong>
              <div style={{ marginTop: '0.5rem' }}>{card.bio}</div>
            </div>
          )}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            onClick={handleCollect}
            disabled={saving}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
            }}
          >
            {saving ? '저장 중...' : '명함 저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
