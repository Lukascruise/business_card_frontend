'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';

/**
 * 보관함(수집한 명함) 목록 페이지
 * API: GET /v1/collections, DELETE /v1/collections/:id
 */
interface CollectionItem {
  collection_id: string;
  card_id: string;
  collected_at: string;
  name: string;
  company?: string | null;
  position?: string | null;
  image_url?: string | null;
}

export default function CollectionsPage() {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const data = await api.get<CollectionItem[]>(ENDPOINTS.COLLECTIONS);
      setItems(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (collectionId: string) => {
    if (!confirm('보관함에서 이 명함을 삭제하시겠습니까?')) return;
    setDeletingId(collectionId);
    try {
      await api.delete(ENDPOINTS.COLLECTION_DETAIL(collectionId));
      setItems((prev) => prev.filter((item) => item.collection_id !== collectionId));
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ProtectedRoute>
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '2rem' }}>보관함</h1>
        {loading && <div>로딩 중...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && !error && (
          <>
            {items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                <p>수집한 명함이 없습니다.</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  공유 링크에서 「명함 저장하기」로 추가한 명함이 여기에 표시됩니다.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {items.map((item) => (
                  <div
                    key={item.collection_id}
                    style={{
                      border: '1px solid #e5e5e5',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      backgroundColor: '#fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                  >
                    {item.image_url && (
                      <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#f5f5f5', overflow: 'hidden' }}>
                        <img
                          src={item.image_url}
                          alt={`${item.name} 명함`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.0625rem', flex: 1 }}>{item.name || '이름 없음'}</h3>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.collection_id)}
                          disabled={deletingId === item.collection_id}
                          style={{
                            padding: '0.35rem 0.6rem',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            cursor: deletingId === item.collection_id ? 'not-allowed' : 'pointer',
                            background: '#fff',
                            fontSize: '0.75rem',
                            color: '#666',
                            flexShrink: 0,
                          }}
                        >
                          {deletingId === item.collection_id ? '삭제 중...' : '삭제'}
                        </button>
                      </div>
                      {(item.company || item.position) && (
                        <p style={{ margin: '0.25rem 0 0 0', color: '#555', fontSize: '0.875rem' }}>
                          {[item.company, item.position].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      <p style={{ margin: '0.5rem 0 0 0', color: '#888', fontSize: '0.8125rem' }}>
                        수집일: {new Date(item.collected_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
