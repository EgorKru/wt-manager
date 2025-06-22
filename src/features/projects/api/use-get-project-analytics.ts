import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";

interface UseGetProjectAnalyticsProps {
  projectId: string;
}

export type ProjectAnalyticsResponseType = {
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

export const useGetProjectAnalytics = ({
  projectId,
}: UseGetProjectAnalyticsProps) => {
  const query = useQuery({
    queryKey: ["project-analytics", projectId],
    queryFn: async () => {
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
