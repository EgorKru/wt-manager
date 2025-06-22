import { useQuery } from "@tanstack/react-query";
import { browserApiClient } from "@/lib/api-client-browser";

interface UseGetProjectProps {
  projectId: string;
}

interface ProjectData {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  workspaceId: string;
  imageUrl?: string;
}

export const useGetProject = ({ projectId }: UseGetProjectProps) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async (): Promise<ProjectData> => {
      const projects = await browserApiClient.getUserProjects();
      const project = projects.find((p: any) => p.projectId === projectId);
      
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }
      
      return {
        $id: project.projectId,
        $createdAt: project.createdAt || new Date().toISOString(),
        $updatedAt: project.updatedAt || new Date().toISOString(),
        name: project.projectName,
        workspaceId: 'default-workspace',
        imageUrl: project.imageUrl || project.image,
      };
    },
  });
};
