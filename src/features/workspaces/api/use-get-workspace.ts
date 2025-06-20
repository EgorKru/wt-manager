import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetWorkspaceProps {
  workspaceId: string;
}

export const useGetWorkspace = ({ workspaceId }: UseGetWorkspaceProps) => {
  const query = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      // Для обычных пользователей возвращаем фиктивный workspace
      if (workspaceId === 'default-workspace') {
        return {
          $id: 'default-workspace',
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString(),
          name: 'My Projects',
          userId: 'current-user',
          inviteCode: null,
          imageUrl: null,
        };
      }
      
      // TODO: Реализовать для админов/владельцев когда будет endpoint
      throw new Error("Workspace not found");
    },
  });
  return query;
};
