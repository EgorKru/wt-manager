import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";

interface UseGetWorkspaceAnalyticsProps {
  workspaceId: string;
}

export type WorkspaceAnalyticsResponseType = {
  taskCount: number;
  taskDifference: number;
  assignedTaskCount: number;
  assignedTaskDifference: number;
  completedTaskCount: number;
  completedTaskDifference: number;
  inCompleteTaskCount: number;
  inCompleteTaskDifference: number;
  overDueTaskCount: number;
  overDueTaskDifference: number;
};

export const useGetWorkspaceAnalytics = ({
  workspaceId,
}: UseGetWorkspaceAnalyticsProps) => {
  const query = useQuery({
    queryKey: ["workspace-analytics", workspaceId],
    queryFn: async () => {
      // Для обычных пользователей возвращаем пустую аналитику
      // TODO: Реализовать когда будет endpoint для аналитики
      return {
        taskCount: 0,
        taskDifference: 0,
        assignedTaskCount: 0,
        assignedTaskDifference: 0,
        completedTaskCount: 0,
        completedTaskDifference: 0,
        inCompleteTaskCount: 0,
        inCompleteTaskDifference: 0,
        overDueTaskCount: 0,
        overDueTaskDifference: 0,
      };
    },
  });
  return query;
};
