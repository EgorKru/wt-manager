"use client";

import { 
  API_BASE_URL, 
  API_VERSION
} from '@/config';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/features/auth/constants';
import type { 
  ApiProject, 
  ApiTask, 
  AppProject, 
  AppTask, 
  LoginRequest, 
  LoginResponse,
  RefreshTokenRequest,
  UpdateTaskStatusRequest,
  UserData 
} from './api-types';
import { transformApiTasksToApp } from './data-transformers';

// Простая функция для получения cookie
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, options: any = {}) {
  if (typeof document === 'undefined') return;
  
  let cookieString = `${name}=${value}`;
  
  if (options.maxAge) {
    cookieString += `; max-age=${options.maxAge}`;
  }
  
  if (options.path) {
    cookieString += `; path=${options.path}`;
  }
  
  if (options.secure) {
    cookieString += `; secure`;
  }
  
  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`;
  }
  
  document.cookie = cookieString;
}

// Функция для сохранения данных пользователя в localStorage
function saveUserData(userData: any) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('user-data', JSON.stringify(userData));
  }
}

// Функция для получения данных пользователя из localStorage
function getUserData() {
  if (typeof localStorage !== 'undefined') {
    const data = localStorage.getItem('user-data');
    return data ? JSON.parse(data) : null;
  }
  return null;
}

// Простой браузерный API клиент
class BrowserAPIClient {
  private baseUrl: string;
  private refreshPromise: Promise<string | null> | null = null;
  private requestCache: Map<string, Promise<any>> = new Map();

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Метод для обновления токена с блокировкой
  private async refreshToken(): Promise<string | null> {
    // Если уже идет процесс обновления токена, ждем его завершения
    if (this.refreshPromise) {
      console.log('Refresh already in progress, waiting...');
      return this.refreshPromise;
    }

    // Создаем новый promise для обновления токена
    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      // Очищаем promise после завершения
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
      const url = `${this.baseUrl}${API_VERSION}/auth/refresh`;
      console.log('Refreshing token at:', url);
      console.log('Refresh token:', refreshToken);
      
      const requestBody = { refreshToken };
      console.log('Request body:', requestBody);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Refresh response status:', response.status);
      
      if (!response.ok) {
        console.error('Failed to refresh token:', response.status);
        
        // Логируем детали ошибки
        try {
          const errorText = await response.text();
          console.error('Refresh error body:', errorText);
        } catch (e) {
          console.error('Could not read refresh error body');
        }
        
        return null;
      }

      const data = await response.json();
      console.log('Refresh response data:', data);
      
      if (data.accessToken) {
        // Сохраняем новый access token
        setCookie(ACCESS_TOKEN_COOKIE, data.accessToken, {
          maxAge: 60 * 60, // 1 час
          path: '/',
          secure: false, // для localhost
          sameSite: 'lax'
        });
        
        // Обновляем refresh token если он пришел
        if (data.refreshToken) {
          setCookie(REFRESH_TOKEN_COOKIE, data.refreshToken, {
            maxAge: 60 * 60 * 24 * 7, // 7 дней
            path: '/',
            secure: false, // для localhost
            sameSite: 'lax'
          });
        }
        
        console.log('Token refreshed successfully');
        return data.accessToken;
      }
      
      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const isAuthEndpoint = endpoint.startsWith('/auth/');
    let accessToken: string | null = null;
    
    if (!isAuthEndpoint) {
      accessToken = getCookie(ACCESS_TOKEN_COOKIE);
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
    
    // Первая попытка с текущим токеном
    let response = await fetch(url, {
      mode: 'cors',
      headers,
      ...options,
    });

    // Если получили 401 и это не auth endpoint, пытаемся обновить токен
    if (response.status === 401 && !isAuthEndpoint) {
      const newAccessToken = await this.refreshToken();
      
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

  async getCurrentUser(): Promise<UserData> {
    const accessToken = getCookie(ACCESS_TOKEN_COOKIE);

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

  saveUserLoginData(email: string, additionalData?: Partial<UserData>): void {
    const userData: UserData = {
      id: additionalData?.id || 'temp-user-id',
      name: additionalData?.name || email,
      email: email,
      createdAt: additionalData?.createdAt || new Date().toISOString(),
      ...additionalData
    };
    
    saveUserData(userData);
  }

  // Методы для работы с проектами
  async getUserProjects(): Promise<ApiProject[]> {
    const cacheKey = 'getUserProjects';
    
    if (this.requestCache.has(cacheKey)) {
      return this.requestCache.get(cacheKey);
    }
    
    const requestPromise = this.executeGetUserProjects();
    this.requestCache.set(cacheKey, requestPromise);
    
    requestPromise.finally(() => {
      this.requestCache.delete(cacheKey);
    });
    
    return requestPromise;
  }

  private async executeGetUserProjects(): Promise<ApiProject[]> {
    return this.request<ApiProject[]>('/projects/users-projects');
  }

  async createProject(data: { name: string; description?: string; [key: string]: any }) {
    return this.request<any>('/projects/create-project', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProjects(workspaceId: string) {
    return this.getUserProjects();
  }

  // Метод для установки активного проекта
  async setProject(projectId: string): Promise<ApiTask[]> {
    const tasks = await this.request<ApiTask[]>(`/projects/set-project/${projectId}`, {
      method: 'POST',
    });
    
    const tasksWithPositions = tasks.map((task, index) => ({
      ...task,
      position: task.position || (index + 1) * 1000
    }));
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`project-${projectId}-tasks`, JSON.stringify(tasksWithPositions));
      localStorage.setItem('current-project-id', projectId);
    }
    
    return tasksWithPositions;
  }

  // Метод для получения задач проекта из localStorage
  async getProjectTasks(projectId: string): Promise<AppTask[]> {
    if (typeof localStorage !== 'undefined') {
      const savedTasks = localStorage.getItem(`project-${projectId}-tasks`);
      if (savedTasks) {
        const tasks: ApiTask[] = JSON.parse(savedTasks);
        return transformApiTasksToApp(tasks);
      }
    }
    
    return [];
  }

  // Метод для обновления статуса задачи
  async updateTaskStatus(code: string, status: string): Promise<any> {
    return this.request<any>('/task/update-status', {
      method: 'PUT',
      body: JSON.stringify({ code, status } as UpdateTaskStatusRequest),
    });
  }

  // Методы для работы с задачами
  async getTasks(projectId: string) {
    return this.request<any>(`/projects/${projectId}/tasks`);
  }

  // Auth методы
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, password } as LoginRequest),
      }
    );

    if (response.accessToken) {
      setCookie(ACCESS_TOKEN_COOKIE, response.accessToken, {
        maxAge: 60 * 60,
        path: '/',
        secure: false,
        sameSite: 'lax'
      });
    }

    if (response.refreshToken) {
      setCookie(REFRESH_TOKEN_COOKIE, response.refreshToken, {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
        secure: false,
        sameSite: 'lax'
      });
    }

    this.saveUserLoginData(username, { name: username });
    return response;
  }
}

export const browserApiClient = new BrowserAPIClient(API_BASE_URL); 