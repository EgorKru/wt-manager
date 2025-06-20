import { useQuery } from "@tanstack/react-query";

export const useGetWorkspaces = () => {
  const query = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      // Для обычных пользователей возвращаем один фиктивный workspace
      // TODO: Реализовать для админов/владельцев когда будет endpoint
      return {
        documents: [{
          $id: 'default-workspace',
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString(),
          name: 'My Projects',
          userId: 'current-user',
          inviteCode: null,
          imageUrl: null,
        }],
        total: 1,
      };
    },
  });
  return query;
};
