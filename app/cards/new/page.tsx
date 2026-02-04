'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { API_KEYS, ENDPOINTS } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';

/**
 * 명함 생성 페이지
 * API: GET /v1/media/presigned-url, POST /v1/cards
 */
export default function NewCardPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // 미리보기
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let finalImageUrl = '';

      // 이미지 업로드
      if (imageFile) {
        const presignedResponse = await api.get<{
          [API_KEYS.UPLOAD_URL]: string;
          [API_KEYS.IMAGE_URL]: string;
        }>(
          `${ENDPOINTS.PRESIGNED_URL}?filename=${encodeURIComponent(imageFile.name)}&file_type=${encodeURIComponent(imageFile.type)}`
        );

        await fetch(presignedResponse[API_KEYS.UPLOAD_URL], {
          method: 'PUT',
          body: imageFile,
          headers: {
            'Content-Type': imageFile.type,
          },
        });

        finalImageUrl = presignedResponse[API_KEYS.IMAGE_URL];
      }

      const cardResponse = await api.post<{ id: string }>(ENDPOINTS.CARDS, {
        name,
        image_url: finalImageUrl || undefined,
      });

      router.push(`/cards/${cardResponse.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>새 명함 만들기</h1>

        <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label>
              명함 이미지 (선택)
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
              />
            </label>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="미리보기"
                style={{ maxWidth: '300px', marginTop: '1rem', border: '1px solid #ddd' }}
              />
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label>
              이름 (필수)
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
              />
            </label>
          </div>

          {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? '저장 중...' : '저장'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
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
        </form>
      </div>
    </ProtectedRoute>
  );
}
