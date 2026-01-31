import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '명함 관리',
  description: '명함 생성 및 공유 서비스',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
