import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";
import { getWorkspaces } from "@/features/workspaces/queries";
import { browserApiClient } from "@/lib/api-client-browser";

export default async function Home() {
  const user = await getCurrent();

  if (!user) {
    redirect("/sign-in");
  }

  // Для обычных пользователей - перенаправляем сразу на проекты
  // TODO: Когда будет endpoint для получения роли пользователя, использовать его
  // Пока используем заглушку - считаем всех обычными пользователями
  const isRegularUser = true; // В будущем: user.role === 'regular'

  if (isRegularUser) {
    // Для обычных пользователей используем фиктивный workspace ID
    redirect("/workspaces/default-workspace");
  }

  // Для админов и владельцев - старая логика с workspaces
  const workspaces = await getWorkspaces();
  if (workspaces?.total === 0) {
    redirect("/workspaces/create");
  } else {
    redirect(`/workspaces/${workspaces?.documents[0].$id}`);
  }
}
