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
  position?: string;
  email?: string;
  phone?: string;
  bio?: string;
  image_url?: string;
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
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [bioExpanded, setBioExpanded] = useState(false);

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

  const handleDelete = async () => {
    if (!confirm('이 명함을 삭제하시겠습니까?')) return;
    setDeleting(true);
    setError('');
    try {
      await api.delete(ENDPOINTS.CARD_DETAIL(cardId));
      router.push('/cards');
    } catch (err: any) {
      setError(err.message || '명함 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
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
                  직함
                  <input
                    type="text"
                    value={formData.position || ''}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
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
          <div
            style={{
              backgroundColor: '#fff',
              border: '1px solid #e5e5e5',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
              <span style={{ color: '#666', fontSize: '0.875rem' }}>명함</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: '#fff',
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
                    borderRadius: '6px',
                    display: 'inline-block',
                    textDecoration: 'none',
                  }}
                >
                  공유하기
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    padding: '0.5rem 1rem',
                    marginLeft: '0.5rem',
                    border: '1px solid #dc3545',
                    backgroundColor: 'transparent',
                    borderRadius: '6px',
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    color: '#dc3545',
                  }}
                >
                  {deleting ? '삭제 중...' : '삭제'}
                </button>
              </div>
            </div>

            {card?.image_url && (
              <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#f5f5f5', overflow: 'hidden' }}>
                <img
                  src={card.image_url}
                  alt={`${card.name} 명함`}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <div style={{ padding: '1.5rem' }}>
              <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem' }}>{card?.name || '이름 없음'}</h1>
              {(card?.company || card?.position) && (
                <p style={{ margin: 0, color: '#555', fontSize: '0.9375rem' }}>
                  {[card?.company, card?.position].filter(Boolean).join(' · ')}
                </p>
              )}
              <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {card?.phone && (
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
                {card?.email && (
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
              {card?.bio && (
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
              <div style={{ marginTop: '1.5rem', color: '#888', fontSize: '0.8125rem' }}>
                수정일: {new Date(card?.updated_at || '').toLocaleString('ko-KR')}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
