'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

const navStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.75rem 1.5rem',
  borderBottom: '1px solid #e5e5e5',
  backgroundColor: '#fff',
};

const linkGroupStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
};

function linkStyle(active: boolean): React.CSSProperties {
  return {
    color: active ? '#0070f3' : '#333',
    textDecoration: 'none',
    fontSize: '0.9375rem',
    fontWeight: active ? 600 : 400,
  };
}

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    auth.removeToken();
    router.push('/auth/login');
  };

  return (
    <nav style={navStyle}>
      <div style={linkGroupStyle}>
        <Link href="/cards" style={linkStyle(pathname.startsWith('/cards'))}>
          내 명함
        </Link>
        <Link href="/collections" style={linkStyle(pathname.startsWith('/collections'))}>
          보관함
        </Link>
      </div>
      <div style={linkGroupStyle}>
        <Link href="/profile" style={linkStyle(pathname.startsWith('/profile'))}>
          프로필
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: 'pointer',
            background: '#fff',
            fontSize: '0.875rem',
            color: '#666',
          }}
        >
          로그아웃
        </button>
      </div>
    </nav>
  );
}
