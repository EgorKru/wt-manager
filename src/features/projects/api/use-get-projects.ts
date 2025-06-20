import { useQuery } from "@tanstack/react-query";
import { browserApiClient } from "@/lib/api-client-browser";

interface UseGetProjectsProps {
  workspaceId: string;
}

export const useGetProjects = ({ workspaceId }: UseGetProjectsProps) => {
  const query = useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async () => {
      console.log('useGetProjects: fetching projects for workspace:', workspaceId);
      
      // Для обычных пользователей получаем их проекты напрямую
      const projects = await browserApiClient.getUserProjects();
      
      // Преобразуем в формат, ожидаемый приложением
      const documents = (projects || []).map((project: any) => ({
        $id: project.projectId,
        $createdAt: project.createdAt || new Date().toISOString(),
        $updatedAt: project.updatedAt || new Date().toISOString(),
        name: project.projectName,
        workspaceId: workspaceId || 'default-workspace',
        imageUrl: project.imageUrl || project.image,
      }));
      
      console.log('useGetProjects: transformed documents:', documents);
      
      return {
        documents,
        total: documents.length,
      };
    },
  });
  return query;
};
