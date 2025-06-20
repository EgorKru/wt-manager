"use client";

import { 
  API_BASE_URL, 
  API_VERSION
} from '@/config';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/features/auth/constants';

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
    console.log('🚀 REQUEST START:', endpoint);
    
    // Для auth endpoints не требуем токен
    const isAuthEndpoint = endpoint.startsWith('/auth/');
    console.log('Making request to:', endpoint, 'isAuthEndpoint:', isAuthEndpoint);
    
    // Логируем все cookies для отладки (только если не auth endpoint)
    if (!isAuthEndpoint) {
      console.log('All cookies:', document.cookie);
    }
    
    let accessToken: string | null = null;
    
    if (!isAuthEndpoint) {
      accessToken = getCookie(ACCESS_TOKEN_COOKIE);
      console.log('ACCESS_TOKEN_COOKIE name:', ACCESS_TOKEN_COOKIE);
      console.log('Access token from getCookie:', accessToken);

      if (!accessToken) {
        throw new Error("Unauthorized - no access token");
      }
    }

    const url = `${this.baseUrl}${API_VERSION}${endpoint}`;
    console.log('Full URL:', url);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Добавляем дополнительные headers из options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    console.log('Request headers:', headers);
    
    // Первая попытка с текущим токеном
    let response = await fetch(url, {
      mode: 'cors',
      headers,
      ...options,
    });

    console.log('First response status:', response.status);

    // Если получили 401 и это не auth endpoint, пытаемся обновить токен
    if (response.status === 401 && !isAuthEndpoint) {
      console.log('Got 401, attempting token refresh...');
      console.log('Access token expired, trying to refresh...');
      
      const newAccessToken = await this.refreshToken();
      
      if (newAccessToken) {
        console.log('Token refreshed successfully, retrying request...');
        console.log('New access token:', newAccessToken);
        
        // Проверяем что токен действительно сохранился в cookies
        const savedToken = getCookie(ACCESS_TOKEN_COOKIE);
        console.log('Token saved in cookies:', savedToken);
        console.log('Tokens match:', newAccessToken === savedToken);
        
        // Повторяем запрос с новым токеном
        const newHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        // Добавляем дополнительные headers из options
        if (options.headers) {
          Object.assign(newHeaders, options.headers);
        }
        
        newHeaders['Authorization'] = `Bearer ${newAccessToken}`;
        console.log('Retrying request with headers:', newHeaders);
        
        response = await fetch(url, {
          mode: 'cors',
          headers: newHeaders,
          ...options,
        });
        
        console.log('Retry response status:', response.status);
      } else {
        // Если не удалось обновить токен, перенаправляем на логин
        console.error('Failed to refresh token, redirecting to login');
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in';
        }
        throw new Error("Session expired");
      }
    }

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}, url: ${url}`);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Клонируем response для чтения тела ошибки
      const clonedResponse = response.clone();
      try {
        const errorText = await clonedResponse.text();
        console.error('Error response body:', errorText);
      } catch (e) {
        console.error('Could not read error response body');
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getCurrentUser() {
    const accessToken = getCookie(ACCESS_TOKEN_COOKIE);

    if (!accessToken) {
      throw new Error("Unauthorized - no access token");
    }

    // Пытаемся получить данные пользователя из localStorage
    const savedUserData = getUserData();
    
    if (savedUserData) {
      return {
        id: savedUserData.id || 'temp-user-id',
        name: savedUserData.name || savedUserData.email || 'User',
        email: savedUserData.email || 'user@example.com',
        createdAt: savedUserData.createdAt || new Date().toISOString(),
      };
    }

    // Если нет сохраненных данных, возвращаем заглушку
    return {
      id: 'temp-user-id',
      name: 'User',
      email: 'user@example.com',
      createdAt: new Date().toISOString(),
    };
  }

  // Новый метод для сохранения данных пользователя при логине
  saveUserLoginData(email: string, additionalData?: any) {
    const userData = {
      id: additionalData?.id || 'temp-user-id',
      name: additionalData?.name || email,
      email: email,
      createdAt: additionalData?.createdAt || new Date().toISOString(),
      ...additionalData
    };
    
    saveUserData(userData);
  }

  // Методы для работы с проектами
  async getUserProjects() {
    const cacheKey = 'getUserProjects';
    
    // Проверяем есть ли уже выполняющийся запрос
    if (this.requestCache.has(cacheKey)) {
      console.log('🔄 getUserProjects: returning cached promise');
      return this.requestCache.get(cacheKey);
    }
    
    // Создаем новый запрос
    const requestPromise = this.executeGetUserProjects();
    
    // Кешируем promise
    this.requestCache.set(cacheKey, requestPromise);
    
    // Очищаем кеш после завершения (успешного или с ошибкой)
    requestPromise.finally(() => {
      this.requestCache.delete(cacheKey);
    });
    
    return requestPromise;
  }

  private async executeGetUserProjects() {
    // Используем endpoint /projects/users-projects
    const url = `${this.baseUrl}${API_VERSION}/projects/users-projects`;
    console.log('🚀 ACTUAL API CALL - Fetching projects from:', url);
    
    try {
      const projects = await this.request<any[]>('/projects/users-projects');
      console.log('Projects received:', projects);
      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async createProject(data: { name: string; description?: string; [key: string]: any }) {
    // Используем endpoint /projects/create-project
    return this.request<any>('/projects/create-project', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProjects(workspaceId: string) {
    // Пока используем getUserProjects
    return this.getUserProjects();
  }

  // Метод для установки активного проекта
  async setProject(projectId: string) {
    console.log('Setting project:', projectId);
    
    try {
      const tasks = await this.request<any[]>(`/projects/set-project/${projectId}`, {
        method: 'POST',
      });
      console.log('Project set successfully, received tasks:', tasks);
      
      // Сохраняем задачи в localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`project-${projectId}-tasks`, JSON.stringify(tasks));
        localStorage.setItem('current-project-id', projectId);
      }
      
      return tasks;
    } catch (error) {
      console.error('Error setting project:', error);
      throw error;
    }
  }

  // Метод для получения задач проекта из localStorage
  async getProjectTasks(projectId: string) {
    if (typeof localStorage !== 'undefined') {
      const savedTasks = localStorage.getItem(`project-${projectId}-tasks`);
      if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        console.log('Getting tasks from localStorage for project:', projectId, tasks);
        
        // Преобразуем задачи из формата API в формат приложения
        const transformedTasks = tasks.map((task: any) => ({
          $id: task.id,
          name: task.title,
          status: task.status, // TODO, IN_PROGRESS, REVIEW, DONE
          workspaceId: 'default-workspace',
          assigneeId: task.assignee,
          projectId: task.projectId,
          position: 1000, // Дефолтная позиция
          dueDate: task.creationDate, // Используем дату создания как dueDate
          description: task.description,
          // Дополнительные поля для совместимости
          priority: task.priority,
          creator: task.creator,
          taskType: task.taskType,
          estimation: task.estimation,
          code: task.code,
          creationDate: task.creationDate,
          updateDate: task.updateDate,
          // Добавляем объекты для таблицы
          project: {
            $id: task.projectId,
            name: 'Current Project', // Заглушка
            imageUrl: '',
          },
          assignee: {
            $id: task.assignee,
            name: 'User', // Заглушка, можно улучшить позже
            email: 'user@example.com',
          },
        }));
        
        return transformedTasks;
      }
    }
    
    // Если нет сохраненных задач, возвращаем пустой массив
    return [];
  }

  // Метод для обновления статуса задачи
  async updateTaskStatus(code: string, status: string) {
    console.log('🎯 UPDATE TASK STATUS CALLED:', { code, status });
    console.log('Updating task status:', { code, status });
    
    try {
      const result = await this.request<any>('/task/update-status', {
        method: 'PUT',
        body: JSON.stringify({ code, status }),
      });
      console.log('Task status updated successfully:', result);
      return result;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  // Методы для работы с задачами (заглушки пока)
  async getTasks(projectId: string) {
    // TODO: Реализовать когда будут endpoints
    return this.request<any>(`/projects/${projectId}/tasks`);
  }

  // Auth методы
  async login(username: string, password: string) {
    const response = await this.request<{ accessToken: string; refreshToken: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }
    );

    // Сохраняем токены в cookies
    if (response.accessToken) {
      setCookie(ACCESS_TOKEN_COOKIE, response.accessToken, {
        maxAge: 60 * 60, // 1 час
        path: '/',
        secure: false, // для localhost
        sameSite: 'lax'
      });
    }

    if (response.refreshToken) {
      setCookie(REFRESH_TOKEN_COOKIE, response.refreshToken, {
        maxAge: 60 * 60 * 24 * 7, // 7 дней
        path: '/',
        secure: false, // для localhost
        sameSite: 'lax'
      });
    }

    // Сохраняем данные пользователя
    this.saveUserLoginData(username, { username });

    return response;
  }
}

export const browserApiClient = new BrowserAPIClient(API_BASE_URL); 