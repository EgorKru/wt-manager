import { API_BASE_URL, API_VERSION } from '@/config';
import { tokenManager } from '../auth/token-manager';

/**
 * Базовый HTTP клиент для API запросов
 */
export class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const isAuthEndpoint = endpoint.startsWith('/auth/');
    let accessToken: string | null = null;
    
    if (!isAuthEndpoint) {
      accessToken = await tokenManager.getAccessToken();
      if (!accessToken) {
        throw new Error("Unauthorized - no access token");
      }
    }

    const url = `${this.baseUrl}${API_VERSION}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (options.headers) {
      Object.assign(headers, options.headers);
    }
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    let response = await fetch(url, {
      mode: 'cors',
      headers,
      ...options,
    });

    // Если получили 401 и это не auth endpoint, пытаемся обновить токен
    if (response.status === 401 && !isAuthEndpoint) {
      const newAccessToken = await tokenManager.refreshToken();
      
      if (newAccessToken) {
        // Повторяем запрос с новым токеном
        const newHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (options.headers) {
          Object.assign(newHeaders, options.headers);
        }
        
        newHeaders['Authorization'] = `Bearer ${newAccessToken}`;
        
        response = await fetch(url, {
          mode: 'cors',
          headers: newHeaders,
          ...options,
        });
      } else {
        // Если не удалось обновить токен, перенаправляем на логин
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in';
        }
        throw new Error("Session expired");
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const httpClient = new HttpClient(API_BASE_URL); 