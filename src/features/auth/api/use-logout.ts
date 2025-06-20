import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { client } from "@/lib/rpc";

// Функция для очистки данных пользователя
function clearUserData() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('user-data');
  }
}

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<{ success: boolean }, Error>({
    mutationFn: async () => {
      // Вызываем серверный endpoint для логаута
      const response = await client.api.auth.logout.$post();
      
      if (!response.ok) {
        throw new Error("Failed to logout");
      }

      // Очищаем данные пользователя из localStorage
      clearUserData();
      
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Logged out");
      
      // Очищаем кэш React Query
      queryClient.clear();
      
      // Перенаправляем на страницу логина
      router.push("/sign-in");
    },
    onError: (error) => {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    },
  });
  return mutation;
};
