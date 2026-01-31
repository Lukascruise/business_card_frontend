/**
 * 인증 관련 유틸리티
 * MVP: localStorage 기반 토큰 관리
 */

import { AUTH_TOKEN_KEY } from './constants';

export const auth = {
  /**
   * 토큰 저장
   */
  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
  },

  /**
   * 토큰 조회
   */
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    }
    return null;
  },

  /**
   * 토큰 삭제
   */
  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  },

  /**
   * 인증 여부 확인
   */
  isAuthenticated: (): boolean => {
    return auth.getToken() !== null;
  },
};
