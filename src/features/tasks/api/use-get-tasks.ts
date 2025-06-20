import { useQuery } from "@tanstack/react-query";

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
      // TODO: Реализовать когда будет endpoint для получения задач
      // Пока возвращаем пустой список
      return {
        documents: [],
        total: 0,
      };
    },
  });
  return query;
};
