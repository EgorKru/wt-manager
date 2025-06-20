import { useQuery } from "@tanstack/react-query";
import { browserApiClient } from "@/lib/api-client-browser";

interface UseGetProjectsProps {
  workspaceId: string;
}

export const useGetProjects = ({ workspaceId }: UseGetProjectsProps) => {
  // Добавляем stack trace для отслеживания откуда вызывается хук
  console.log('🔍 useGetProjects called from:', new Error().stack?.split('\n')[2]?.trim());
  
  const query = useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async () => {
      console.log('🚀 useGetProjects: ACTUAL API CALL for workspace:', workspaceId);
      console.log('📍 API call stack trace:', new Error().stack?.split('\n')[2]?.trim());
      
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
    staleTime: 5 * 60 * 1000, // 5 минут - данные считаются свежими
    gcTime: 10 * 60 * 1000, // 10 минут - время жизни в кеше  
    refetchOnWindowFocus: false, // Не перезапрашивать при фокусе окна
    refetchOnMount: false, // Не перезапрашивать при монтировании если есть кеш
  });
  return query;
};
