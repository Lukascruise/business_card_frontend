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
  position?: string;
  email?: string;
  phone?: string;
  bio?: string;
}

/** 백엔드 raw 응답: flat 또는 { card_id, data?: { name, ... } } */
type SharedCardRaw =
  | SharedCard
  | { card_id: string; data?: { name?: string; company?: string; position?: string; email?: string; phone?: string; bio?: string } };

function flattenSharedCard(res: SharedCardRaw): SharedCard {
  if ('data' in res && res.data && typeof res.data === 'object') {
    const d = res.data;
    return {
      card_id: res.card_id,
      name: d.name ?? '',
      company: d.company,
      position: d.position,
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
    position: flat.position,
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
  const [bioExpanded, setBioExpanded] = useState(false);

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
      <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#666', fontSize: '0.875rem' }}>공유 명함</p>

      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #e5e5e5',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '1.5rem' }}>
          <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem' }}>{card.name || '이름 없음'}</h1>
          {(card.company || card.position) && (
            <p style={{ margin: 0, color: '#555', fontSize: '0.9375rem' }}>
              {[card.company, card.position].filter(Boolean).join(' · ')}
            </p>
          )}
          <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {card.phone && (
              <a
                href={`tel:${card.phone.replace(/\s/g, '')}`}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: '#333',
                  fontSize: '0.875rem',
                }}
              >
                📞 {card.phone}
              </a>
            )}
            {card.email && (
              <a
                href={`mailto:${card.email}`}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: '#333',
                  fontSize: '0.875rem',
                }}
              >
                ✉️ 이메일 보내기
              </a>
            )}
          </div>
          {card.bio && (
            <section style={{ marginTop: '1.5rem' }}>
              <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 600, color: '#333' }}>소개</h2>
              <div style={{ lineHeight: 1.6, color: '#444', fontSize: '0.9375rem' }}>
                {card.bio.length > 120 && !bioExpanded
                  ? `${card.bio.slice(0, 120)}...`
                  : card.bio}
              </div>
              {card.bio.length > 120 && (
                <button
                  type="button"
                  onClick={() => setBioExpanded(!bioExpanded)}
                  style={{
                    marginTop: '0.5rem',
                    padding: 0,
                    border: 'none',
                    background: 'none',
                    color: '#0070f3',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  {bioExpanded ? '접기' : '더보기'}
                </button>
              )}
            </section>
          )}
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #eee', textAlign: 'center' }}>
          <button
            onClick={handleCollect}
            disabled={saving}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
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
