import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { browserApiClient } from "@/lib/api-client-browser";

export const useSetProject = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (projectId: string) => {
      return await browserApiClient.setProject(projectId);
    },
    onSuccess: () => {
      console.log("Project set successfully");
      // Инвалидируем кэш задач чтобы они обновились
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      console.error("Failed to set project:", error);
      toast.error("Failed to set project");
    },
  });

  return mutation;
}; 