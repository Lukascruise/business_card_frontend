'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/constants';

/**
 * 명함 목록 페이지
 * API: GET /v1/cards
 */
interface Card {
  id: string;
  name: string;
  updated_at: string;
}

export default function CardsPage() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const data = await api.get<Card[]>(ENDPOINTS.CARDS);
      setCards(data);
    } catch (err: any) {
      setError(err.message || '명함 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth.removeToken();
    router.push('/auth/login');
  };

  return (
    <ProtectedRoute>
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>내 명함</h1>
          <div>
            <Link
              href="/cards/new"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#0070f3',
                color: 'white',
                borderRadius: '4px',
                display: 'inline-block',
              }}
            >
              새 명함 만들기
            </Link>
            <Link
              href="/profile"
              style={{
                padding: '0.75rem 1.5rem',
                marginLeft: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                display: 'inline-block',
              }}
            >
              프로필
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                marginLeft: '0.5rem',
                padding: '0.75rem 1.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              로그아웃
            </button>
          </div>
        </div>

        {loading && <div>로딩 중...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}

        {!loading && !error && (
          <div>
            {cards.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                명함이 없습니다. 새 명함을 만들어보세요.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {cards.map((card) => (
                  <Link
                    key={card.id}
                    href={`/cards/${card.id}`}
                    style={{
                      padding: '1.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      display: 'block',
                      cursor: 'pointer',
                    }}
                  >
                    <h3>{card.name || '이름 없음'}</h3>
                    <p style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                      {new Date(card.updated_at).toLocaleDateString('ko-KR')}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
