import { useQuery } from "@tanstack/react-query";
import { browserApiClient } from "@/lib/api-client-browser";

interface UseGetProjectProps {
  projectId: string;
}

export const useGetProject = ({ projectId }: UseGetProjectProps) => {
  const query = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      // Получаем список проектов и находим нужный
      const projects = await browserApiClient.getUserProjects();
      const project = projects.find((p: any) => p.projectId === projectId);
      
      if (!project) {
        throw new Error("Project not found");
      }
      
      // Преобразуем в формат, ожидаемый приложением
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
  return query;
};
