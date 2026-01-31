/**
 * API 응답 타입 정의
 * 백엔드 API 스펙에 맞춰 정의
 */

// Auth
export interface SignupResponse {
  access_token: string;
  user_id: string;
}

// Media
export interface PresignedUrlResponse {
  upload_url: string;
  image_url: string;
}

// Card
export interface CardListItem {
  card_id: string;
  name: string;
  updated_at: string;
}

export interface CardDetail {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  bio?: string;
  updated_at: string;
}

export interface CreateCardRequest {
  name: string;
  image_url?: string;
}

export interface CreateCardResponse {
  card_id: string;
}

export interface UpdateCardRequest {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  bio?: string;
}

// Share Token
export interface CreateTokenRequest {
  expires_at: string;
}

export interface CreateTokenResponse {
  share_token: string;
  expires_at: string;
}

export interface DeactivateTokenResponse {
  status: string;
}

// Shared Card
export interface SharedCard {
  card_id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  bio?: string;
}

// Collection
export interface CreateCollectionRequest {
  card_id: string;
}

export interface CreateCollectionResponse {
  collection_id: string;
}

// User Profile
export interface UserProfile {
  user_id: string;
  email: string;
  name?: string;
  bio?: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
}
