/**
 * API·인증 상수 (백엔드 계약과 동기화)
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/** API 엔드포인트 (DRF ViewSet은 trailing slash 사용) */
export const ENDPOINTS = {
  AUTH_SIGNUP: '/v1/auth/signup',
  AUTH_LOGIN: '/v1/auth/login',
  USER_PROFILE: '/v1/user/profile',
  CARDS: '/v1/cards/',
  CARD_DETAIL: (id: string) => `/v1/cards/${id}/`,
  CARD_TOKENS: (id: string) => `/v1/cards/${id}/tokens`,
  TOKEN_DEACTIVATE: (id: string) => `/v1/tokens/${id}/deactivate`,
  COLLECTIONS: '/v1/collections',
  PRESIGNED_URL: '/v1/media/presigned-url',
  SHARED_CARD: (token: string) => `/v1/s/${token}`,
} as const;

/** 응답/요청 키 (백엔드 ApiKeys와 일치) */
export const API_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_ID: 'user_id',
  TOKEN_ID: 'token_id',
  SHARE_TOKEN: 'share_token',
  EXPIRES_AT: 'expires_at',
  STATUS: 'status',
  CARD_ID: 'card_id',
  COLLECTION_ID: 'collection_id',
  UPLOAD_URL: 'upload_url',
  IMAGE_URL: 'image_url',
} as const;

/** localStorage 토큰 키 (API_KEYS.ACCESS_TOKEN과 동일 권장) */
export const AUTH_TOKEN_KEY = API_KEYS.ACCESS_TOKEN;

/** DRF TokenAuthentication 헤더 prefix */
export const AUTH_HEADER_PREFIX = 'Token';
