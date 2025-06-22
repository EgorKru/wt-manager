import { getCookie, setCookie } from './cookie-utils';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/features/auth/constants';
import { API_BASE_URL, API_VERSION } from '@/config';
import type { RefreshTokenRequest } from './api-types';

/**
 * Менеджер для работы с токенами аутентификации
 */
export class TokenManager {
  private refreshPromise: Promise<string | null> | null = null;

  async getAccessToken(): Promise<string | null> {
    return getCookie(ACCESS_TOKEN_COOKIE);
  }

  async refreshToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string | null> {
    const refreshToken = getCookie(REFRESH_TOKEN_COOKIE);
    
    if (!refreshToken) {
      console.error('No refresh token available');
      return null;
    }

    try {
      const url = `${API_BASE_URL}${API_VERSION}/auth/refresh`;
      const requestBody: RefreshTokenRequest = { refreshToken };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        console.error('Failed to refresh token:', response.status);
        return null;
      }

      const data = await response.json();
      
      if (data.accessToken) {
        this.saveTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
      }
      
      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  saveTokens(accessToken: string, refreshToken?: string): void {
    setCookie(ACCESS_TOKEN_COOKIE, accessToken, {
      maxAge: 60 * 60,
      path: '/',
      secure: false,
      sameSite: 'lax'
    });

    if (refreshToken) {
      setCookie(REFRESH_TOKEN_COOKIE, refreshToken, {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
        secure: false,
        sameSite: 'lax'
      });
    }
  }

  clearTokens(): void {
    setCookie(ACCESS_TOKEN_COOKIE, '', { maxAge: 0, path: '/' });
    setCookie(REFRESH_TOKEN_COOKIE, '', { maxAge: 0, path: '/' });
  }
}

export const tokenManager = new TokenManager(); 