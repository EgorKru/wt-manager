import type { ApiProject, ApiTask, AppProject, AppTask } from './types';

/**
 * Трансформирует проект из формата API в формат приложения
 */
export function transformApiProjectToApp(
  project: ApiProject, 
  workspaceId: string = 'default-workspace'
): AppProject {
  return {
    $id: project.projectId,
    $createdAt: project.createdAt || new Date().toISOString(),
    $updatedAt: project.updatedAt || new Date().toISOString(),
    name: project.projectName,
    workspaceId,
    imageUrl: project.imageUrl || project.image,
  };
}

/**
 * Трансформирует задачу из формата API в формат приложения
 */
export function transformApiTaskToApp(task: ApiTask): AppTask {
  return {
    $id: task.id,
    name: task.title,
    status: task.status,
    workspaceId: 'default-workspace',
    assigneeId: task.assignee,
    projectId: task.projectId,
    position: task.position || 1000,
    dueDate: task.creationDate,
    description: task.description,
    priority: task.priority,
    creator: task.creator,
    taskType: task.taskType,
    estimation: task.estimation,
    code: task.code,
    creationDate: task.creationDate,
    updateDate: task.updateDate,
    project: {
      $id: task.projectId,
      name: 'Current Project',
      imageUrl: '',
    },
    assignee: {
      $id: task.assignee,
      name: 'User',
      email: 'user@example.com',
    },
  };
}

/**
 * Трансформирует массив проектов из API в формат приложения
 */
export function transformApiProjectsToApp(
  projects: ApiProject[],
  workspaceId?: string
): AppProject[] {
  return projects.map(project => transformApiProjectToApp(project, workspaceId));
}

/**
 * Трансформирует массив задач из API в формат приложения и сортирует по позиции
 */
export function transformApiTasksToApp(tasks: ApiTask[]): AppTask[] {
  const transformedTasks = tasks.map(transformApiTaskToApp);
  return transformedTasks.sort((a, b) => a.position - b.position);
} 