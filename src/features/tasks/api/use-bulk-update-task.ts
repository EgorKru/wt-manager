import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { browserApiClient } from "@/lib/api-client-browser";
import { TaskStatus } from "../types";

interface TaskUpdate {
  $id: string;
  status: TaskStatus;
  position: number;
  code?: string; // Добавляем code для каждой задачи
}

interface UpdateTasksRequest {
  tasks: TaskUpdate[];
}

export const useBulkUpdateTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, UpdateTasksRequest>({
    mutationFn: async ({ tasks }) => {
      console.log('Bulk updating tasks:', tasks);
      
      // Для каждой задачи делаем отдельный запрос обновления статуса
      const promises = tasks.map(async (task) => {
        // Получаем code задачи из localStorage если он не передан в task
        let taskCode = task.code;
        
        if (!taskCode) {
          const projectId = localStorage.getItem('current-project-id');
          if (!projectId) {
            console.warn('No current project ID found');
            return;
          }
          
          const savedTasks = localStorage.getItem(`project-${projectId}-tasks`);
          if (!savedTasks) {
            console.warn('No saved tasks found');
            return;
          }
          
          const allTasks = JSON.parse(savedTasks);
          const taskData = allTasks.find((t: any) => t.id === task.$id);
          
          if (!taskData || !taskData.code) {
            console.warn('Task code not found for task:', task.$id);
            return;
          }
          
          taskCode = taskData.code;
        }
        
        // Вызываем API для обновления статуса
        if (!taskCode) {
          console.warn('Unable to find task code for task:', task.$id);
          return;
        }
        
        const result = await browserApiClient.updateTaskStatus(taskCode, task.status);
        
        // Обновляем задачу в localStorage
        const projectId = localStorage.getItem('current-project-id');
        if (projectId) {
          const savedTasks = localStorage.getItem(`project-${projectId}-tasks`);
          if (savedTasks) {
            const allTasks = JSON.parse(savedTasks);
            const updatedTasks = allTasks.map((t: any) => 
              t.id === task.$id ? { ...t, status: task.status } : t
            );
            localStorage.setItem(`project-${projectId}-tasks`, JSON.stringify(updatedTasks));
          }
        }
        
        return result;
      });
      
      await Promise.all(promises);
    },
    onSuccess: () => {
      toast.success("Tasks updated");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error('Failed to update tasks:', error);
      toast.error("Failed to update tasks");
    },
  });
  return mutation;
};
