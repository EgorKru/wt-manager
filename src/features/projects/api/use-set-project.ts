import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { browserApiClient } from "@/lib/api-client-browser";

export const useSetProject = () => {
  const mutation = useMutation({
    mutationFn: async (projectId: string) => {
      return await browserApiClient.setProject(projectId);
    },
    onSuccess: () => {
      console.log("Project set successfully");
    },
    onError: (error) => {
      console.error("Failed to set project:", error);
      toast.error("Failed to set project");
    },
  });

  return mutation;
}; 