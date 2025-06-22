import "server-only";

import { cookies } from "next/headers";
import { API_BASE_URL, API_VERSION } from "@/config";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/features/auth/constants";

// HTTP клиент для работы с API
class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${API_VERSION}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private async authenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE);

    if (!accessToken?.value) {
      throw new Error("Unauthorized - no access token");
    }

    return this.request<T>(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken.value}`,
        ...options.headers,
      },
    });
  }

  // Auth методы
  async login(username: string, password: string) {
    return this.request<{ accessToken: string; refreshToken: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }
    );
  }

  async refreshToken(refreshToken: string) {
    return this.request<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }
    );
  }

  // Методы для работы с пользователем (заглушки пока)
  async getCurrentUser() {
    // TODO: Реализовать когда будет endpoint /user/me
    // Пока возвращаем фиксированные данные на основе наличия токена
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE);
    const userEmail = cookieStore.get("user-email");

    if (!accessToken?.value) {
      throw new Error("Unauthorized - no access token");
    }

    // Используем email из cookie
    const email = userEmail?.value || 'user@example.com';
    const name = email.split('@')[0]; // Используем часть до @ как имя

    // Временная заглушка - возвращаем пользователя на основе cookie
    // В реальности здесь должен быть запрос к вашему API
    return {
      id: 'temp-user-id',
      userId: 'temp-user-id',
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
      username: email,
      email: email,
      createdAt: new Date().toISOString(),
    };
    
    // Когда будет endpoint:
    // return this.authenticatedRequest<any>('/user/me');
  }

  // Методы для работы с workspace (заглушки пока)
  async getWorkspaces() {
    // TODO: Реализовать когда будут endpoints
    return this.authenticatedRequest<any>('/workspaces');
  }

  async createWorkspace(data: any) {
    // TODO: Реализовать когда будут endpoints
    return this.authenticatedRequest<any>('/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Методы для работы с проектами
  async getUserProjects() {
    // Используем endpoint /projects/users-projects
    return this.authenticatedRequest<any[]>('/projects/users-projects');
  }

  async createProject(data: { name: string; description?: string; [key: string]: any }) {
    // Используем endpoint /projects/create-project
    return this.authenticatedRequest<any>('/projects/create-project', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProjects(workspaceId: string) {
    // TODO: Реализовать когда будут endpoints
    // Пока используем getUserProjects
    return this.getUserProjects();
  }

  // Методы для работы с задачами (заглушки пока)
  async getTasks(projectId: string) {
    // TODO: Реализовать когда будут endpoints
    return this.authenticatedRequest<any>(`/projects/${projectId}/tasks`);
  }
}

export const apiClient = new APIClient(API_BASE_URL); 