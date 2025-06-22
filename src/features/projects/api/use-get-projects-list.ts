import { useQuery } from "@tanstack/react-query";
import { browserApiClient } from "@/lib/api-client-browser";
import { transformApiProjectsToApp } from "@/lib/data-transformers";
import type { AppProject } from "@/lib/api-types";

interface UseGetProjectsProps {
  workspaceId: string;
}

interface ProjectsResponse {
  documents: AppProject[];
  total: number;
}

const QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
} as const;

export const useGetProjects = ({ workspaceId }: UseGetProjectsProps) => {
  return useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async (): Promise<ProjectsResponse> => {
      const projects = await browserApiClient.getUserProjects();
      const documents = transformApiProjectsToApp(projects, workspaceId);
      
      return {
        documents,
        total: documents.length,
      };
    },
    ...QUERY_CONFIG,
  });
};
