'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';

/**
 * 프로필 페이지
 * API: GET /v1/user/profile, PUT /v1/user/profile
 */
interface Profile {
  user_id: string;
  email: string;
  name?: string;
  bio?: string;
  updated_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.get<Profile>(ENDPOINTS.USER_PROFILE);
      setProfile(data);
      setFormData(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const updated = await api.put<Profile>(ENDPOINTS.USER_PROFILE, formData);
      setProfile(updated);
      setIsEditing(false);
    } catch (err) {
      setError(getErrorMessage(err));
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

  return (
    <ProtectedRoute>
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1>프로필</h1>

        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

        {isEditing ? (
          <div style={{ marginTop: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label>
                이메일
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', backgroundColor: '#f5f5f5' }}
                />
                <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                  이메일은 변경할 수 없습니다.
                </div>
              </label>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>
                이름
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  setFormData(profile || {});
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
        ) : (
          <div style={{ marginTop: '2rem' }}>
            <div style={{ lineHeight: '1.8' }}>
              <div><strong>이메일:</strong> {profile?.email}</div>
              {profile?.name && <div><strong>이름:</strong> {profile.name}</div>}
              {profile?.bio && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>소개:</strong>
                  <div style={{ marginTop: '0.5rem' }}>{profile.bio}</div>
                </div>
              )}
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                수정
              </button>
              <button
                type="button"
                onClick={() => {
                  auth.removeToken();
                  router.push('/auth/login');
                }}
                style={{
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
        )}
      </div>
    </ProtectedRoute>
  );
}
