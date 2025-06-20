import { useQuery } from "@tanstack/react-query";

import { browserApiClient } from "@/lib/api-client-browser";
import { TaskStatus } from "../types";

interface UseGetTasksProps {
  workspaceId: string;
  projectId?: string | null;
  status?: TaskStatus | null;
  assigneeId?: string | null;
  dueDate?: string | null;
  search?: string | null;
}

export const useGetTasks = ({
  workspaceId,
  assigneeId,
  dueDate,
  projectId,
  status,
  search,
}: UseGetTasksProps) => {
  const query = useQuery({
    queryKey: [
      "tasks",
      workspaceId,
      assigneeId,
      dueDate,
      projectId,
      status,
      search,
    ],
    queryFn: async () => {
      // Для обычных пользователей получаем задачи из localStorage
      if (workspaceId === 'default-workspace' && projectId) {
        const tasks = await browserApiClient.getProjectTasks(projectId);
        console.log('Tasks fetched for project:', projectId, tasks);
        
        // Применяем фильтры
        let filteredTasks = tasks;
        
        if (status) {
          filteredTasks = filteredTasks.filter((task: any) => task.status === status);
        }
        
        if (assigneeId) {
          filteredTasks = filteredTasks.filter((task: any) => task.assigneeId === assigneeId);
        }
        
        if (search) {
          const searchLower = search.toLowerCase();
          filteredTasks = filteredTasks.filter((task: any) => 
            task.name.toLowerCase().includes(searchLower) ||
            task.description?.toLowerCase().includes(searchLower)
          );
        }
        
        if (dueDate) {
          filteredTasks = filteredTasks.filter((task: any) => {
            const taskDate = new Date(task.dueDate).toDateString();
            const filterDate = new Date(dueDate).toDateString();
            return taskDate === filterDate;
          });
        }
        
        return {
          documents: filteredTasks,
          total: filteredTasks.length,
        };
      }
      
      // Для остальных случаев возвращаем пустой список
      return {
        documents: [],
        total: 0,
      };
    },
  });
  return query;
};
