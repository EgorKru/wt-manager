import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetMembersProps {
  workspaceId: string;
}

export const useGetMembers = ({ workspaceId }: UseGetMembersProps) => {
  const query = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: async () => {
      // Для обычных пользователей возвращаем пустой список
      // TODO: Реализовать когда будет endpoint для получения членов workspace
      return {
        documents: [],
        total: 0,
      };
    },
  });
  return query;
};
