"use client";

import { authService } from './api/services/auth-service';
import { projectService } from './api/services/project-service';
import { taskService } from './api/services/task-service';

/**
 * Компактный API клиент объединяющий все сервисы
 */
export class BrowserAPIClient {
  // Auth методы
  async login(username: string, password: string) {
    return authService.login(username, password);
  }

  async getCurrentUser() {
    return authService.getCurrentUser();
  }

  async logout() {
    return authService.logout();
  }

  // Project методы
  async getUserProjects() {
    return projectService.getUserProjects();
  }

  async createProject(data: { name: string; description?: string; [key: string]: any }) {
    return projectService.createProject(data);
  }

  async getProjects(workspaceId: string) {
    return projectService.getProjects(workspaceId);
  }

  // Task методы
  async setProject(projectId: string) {
    return taskService.setProject(projectId);
  }

  async getProjectTasks(projectId: string) {
    return taskService.getProjectTasks(projectId);
  }

  async updateTaskStatus(code: string, status: string) {
    return taskService.updateTaskStatus(code, status);
  }

  async getTasks(projectId: string) {
    return taskService.getTasks(projectId);
  }

  // Legacy методы для совместимости
  saveUserLoginData(email: string, additionalData?: any) {
    // Этот метод теперь вызывается внутри authService.login
    console.warn('saveUserLoginData is deprecated, use login method instead');
  }
}

export const browserApiClient = new BrowserAPIClient(); 