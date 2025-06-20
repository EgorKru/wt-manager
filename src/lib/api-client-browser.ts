"use client";

import { API_BASE_URL, API_VERSION } from "@/config";
import { ACCESS_TOKEN_COOKIE } from "@/features/auth/constants";

// Простая функция для получения cookie
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
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

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Логируем все cookies для отладки
    console.log('All cookies:', document.cookie);
    
    const accessToken = getCookie(ACCESS_TOKEN_COOKIE);
    console.log('ACCESS_TOKEN_COOKIE name:', ACCESS_TOKEN_COOKIE);
    console.log('Access token from getCookie:', accessToken);

    if (!accessToken) {
      throw new Error("Unauthorized - no access token");
    }

    const url = `${this.baseUrl}${API_VERSION}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
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
    // Используем endpoint /projects/users-projects
    const url = `${this.baseUrl}${API_VERSION}/projects/users-projects`;
    console.log('Fetching projects from:', url);
    
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
      const result = await this.request<any>(`/projects/set-project/${projectId}`, {
        method: 'POST',
      });
      console.log('Project set successfully:', result);
      return result;
    } catch (error) {
      console.error('Error setting project:', error);
      throw error;
    }
  }

  // Методы для работы с задачами (заглушки пока)
  async getTasks(projectId: string) {
    // TODO: Реализовать когда будут endpoints
    return this.request<any>(`/projects/${projectId}/tasks`);
  }
}

export const browserApiClient = new BrowserAPIClient(API_BASE_URL); 