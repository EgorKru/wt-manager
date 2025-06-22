import { httpClient } from '../http-client';
import { transformApiTasksToApp } from '../data-transformers';
import type { ApiTask, AppTask, UpdateTaskStatusRequest } from '../api-types';

/**
 * Сервис для работы с задачами
 */
export class TaskService {
  async setProject(projectId: string): Promise<ApiTask[]> {
    const tasks = await httpClient.request<ApiTask[]>(`/projects/set-project/${projectId}`, {
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

  async updateTaskStatus(code: string, status: string): Promise<any> {
    return httpClient.request<any>('/task/update-status', {
      method: 'PUT',
      body: JSON.stringify({ code, status } as UpdateTaskStatusRequest),
    });
  }

  async getTasks(projectId: string) {
    return httpClient.request<any>(`/projects/${projectId}/tasks`);
  }
}

export const taskService = new TaskService(); 