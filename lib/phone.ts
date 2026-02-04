/**
 * 전화번호: 화면에는 하이픈 포맷(010-1234-5678), 서버에는 숫자만(01012345678) 전송.
 */

/** 숫자만 추출 (최대 11자리, 010 기준) */
export function getPhoneDigits(phone: string | undefined | null): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '').slice(0, 11);
}

/**
 * 입력 시 사용: 입력값에서 숫자만 남기고 최대 11자리로 제한.
 * state에는 이 값(숫자만)을 저장하고, 화면 표시는 formatPhoneDisplay로.
 */
export function normalizePhoneInput(raw: string): string {
  return getPhoneDigits(raw);
}

/**
 * 화면 표시용: 01012345678 → 010-1234-5678 (또는 010-123-4567).
 * 입력 필드 value나 읽기 전용 표시에 사용.
 */
export function formatPhoneDisplay(phone: string | undefined | null): string {
  const d = getPhoneDigits(phone);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `010-${d.slice(3)}`;
  if (d.length <= 10) return `010-${d.slice(3, 6)}-${d.slice(6)}`;
  return `010-${d.slice(3, 7)}-${d.slice(7)}`;
}
