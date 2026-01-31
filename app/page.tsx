import { redirect } from 'next/navigation';

/**
 * 루트 페이지
 * 명함 목록으로 리다이렉트
 */
export default function HomePage() {
  redirect('/cards');
}
