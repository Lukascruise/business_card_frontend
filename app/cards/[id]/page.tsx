'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/constants';

/**
 * 명함 상세/수정 페이지
 * API: GET /v1/cards/:id, PUT /v1/cards/:id
 */
interface Card {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  bio?: string;
  updated_at: string;
}

export default function CardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const cardId = params.id as string;

  const [card, setCard] = useState<Card | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Card>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCard();
  }, [cardId]);

  const fetchCard = async () => {
    try {
      const data = await api.get<Card>(ENDPOINTS.CARD_DETAIL(cardId));
      setCard(data);
      setFormData(data);
    } catch (err: any) {
      setError(err.message || '명함을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const updated = await api.put<Card>(ENDPOINTS.CARD_DETAIL(cardId), formData);
      setCard(updated);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || '명함 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div style={{ padding: '2rem' }}>로딩 중...</div>
      </ProtectedRoute>
    );
  }

  if (error && !card) {
    return (
      <ProtectedRoute>
        <div style={{ padding: '2rem', color: 'red' }}>{error}</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1rem' }}>
          <Link href="/cards" style={{ color: '#0070f3' }}>
            ← 목록으로
          </Link>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

        {isEditing ? (
          <div>
            <h1>명함 수정</h1>
            <div style={{ marginTop: '2rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label>
                  이름 (필수)
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>
                  회사
                  <input
                    type="text"
                    value={formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>
                  이메일
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>
                  전화번호
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>
                  소개
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', minHeight: '100px' }}
                  />
                </label>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#0070f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(card || {});
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
              <h1>{card?.name || '이름 없음'}</h1>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  수정
                </button>
                <Link
                  href={`/cards/${cardId}/share`}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#0070f3',
                    color: 'white',
                    borderRadius: '4px',
                    display: 'inline-block',
                  }}
                >
                  공유하기
                </Link>
              </div>
            </div>

            <div style={{ lineHeight: '1.8' }}>
              {card?.company && <div><strong>회사:</strong> {card.company}</div>}
              {card?.email && <div><strong>이메일:</strong> {card.email}</div>}
              {card?.phone && <div><strong>전화번호:</strong> {card.phone}</div>}
              {card?.bio && <div style={{ marginTop: '1rem' }}><strong>소개:</strong><br />{card.bio}</div>}
              <div style={{ marginTop: '1rem', color: '#666', fontSize: '0.875rem' }}>
                수정일: {new Date(card?.updated_at || '').toLocaleString('ko-KR')}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
