import { httpClient } from '../http-client';
import { tokenManager } from '../token-manager';
import { saveUserData, getUserData } from '../user-storage';
import type { LoginRequest, LoginResponse, UserData } from '../api-types';

/**
 * Сервис для работы с аутентификацией
 */
export class AuthService {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await httpClient.request<LoginResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, password } as LoginRequest),
      }
    );

    if (response.accessToken && response.refreshToken) {
      tokenManager.saveTokens(response.accessToken, response.refreshToken);
      this.saveUserLoginData(username, { name: username });
    }

    return response;
  }

  async getCurrentUser(): Promise<UserData> {
    const accessToken = await tokenManager.getAccessToken();

    if (!accessToken) {
      throw new Error("Unauthorized - no access token");
    }

    const savedUserData = getUserData();
    
    if (savedUserData) {
      return {
        id: savedUserData.id || 'temp-user-id',
        name: savedUserData.name || savedUserData.email || 'User',
        email: savedUserData.email || 'user@example.com',
        createdAt: savedUserData.createdAt || new Date().toISOString(),
      };
    }

    return {
      id: 'temp-user-id',
      name: 'User',
      email: 'user@example.com',
      createdAt: new Date().toISOString(),
    };
  }

  private saveUserLoginData(email: string, additionalData?: Partial<UserData>): void {
    const userData: UserData = {
      id: additionalData?.id || 'temp-user-id',
      name: additionalData?.name || email,
      email: email,
      createdAt: additionalData?.createdAt || new Date().toISOString(),
      ...additionalData
    };
    
    saveUserData(userData);
  }

  async logout(): Promise<void> {
    tokenManager.clearTokens();
    // Можно добавить вызов API для logout если нужно
  }
}

export const authService = new AuthService(); 