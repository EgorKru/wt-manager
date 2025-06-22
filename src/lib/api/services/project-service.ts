import { httpClient } from '../http-client';
import type { ApiProject } from '../types';

/**
 * Сервис для работы с проектами
 */
export class ProjectService {
  private requestCache: Map<string, Promise<any>> = new Map();

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
    return httpClient.request<ApiProject[]>('/projects/users-projects');
  }

  async createProject(data: { name: string; description?: string; [key: string]: any }) {
    return httpClient.request<any>('/projects/create-project', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProjects(workspaceId: string) {
    return this.getUserProjects();
  }
}

export const projectService = new ProjectService(); 