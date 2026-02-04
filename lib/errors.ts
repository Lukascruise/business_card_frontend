import type { ApiError } from './api';

/**
 * 백엔드 error.code → 프론트 표시용 메시지 (API message 없을 때 폴백)
 * core/domain/errors.py ErrorCode·ErrorMessages와 대응
 */
const FALLBACK_MESSAGES: Record<string, string> = {
  'CARD.NOT_FOUND': '명함을 찾을 수 없습니다.',
  'AUTH.INVALID_TOKEN': '인증 정보가 유효하지 않습니다.',
  'AUTH.EMAIL_ALREADY_USED': '이미 사용 중인 이메일입니다.',
  'AUTH.INVALID_CREDENTIALS': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'IMG.R2_UPLOAD_FAILED': '이미지 업로드에 실패했습니다.',
  'IMG.INVALID_EXTENSION': '허용되지 않는 이미지 확장자입니다.',
  'CARD.INVALID_PHONE': '전화번호 형식이 올바르지 않습니다.',
  'COLLECTION.CANNOT_COLLECT_OWN': '자기 명함은 수집할 수 없습니다.',
  'COLLECTION.ALREADY_COLLECTED': '이미 수집한 명함입니다.',
  'COLLECTION.NOT_FOUND': '수집한 명함을 찾을 수 없습니다.',
  'COMMON.INTERNAL_ERROR': '서버 오류가 발생했습니다.',
  'COMMON.DATA_CONFLICT': '데이터 충돌이 발생했습니다.',
  'COMMON.DB_SCHEMA_NOT_READY': 'DB 스키마가 준비되지 않았습니다.',
  'COMMON.VALIDATION_ERROR': '입력값을 확인해 주세요.',
};

const GENERIC_MESSAGE = '오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';

/**
 * API/기타 예외에서 사용자에게 보여줄 메시지 추출.
 * - ApiError(백엔드 응답) → error.message 사용, 없으면 code 폴백
 * - 그 외 → GENERIC_MESSAGE
 */
export function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message?: string }).message;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  const apiErr = err as ApiError | undefined;
  if (apiErr?.code && FALLBACK_MESSAGES[apiErr.code]) {
    return FALLBACK_MESSAGES[apiErr.code];
  }
  if (apiErr?.status === 401) return '로그인이 필요합니다.';
  if (apiErr?.status === 403) return '권한이 없습니다.';
  if (apiErr?.status === 404) return '요청한 항목을 찾을 수 없습니다.';
  if (apiErr?.status && apiErr.status >= 500) return '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
  return GENERIC_MESSAGE;
}
