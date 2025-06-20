"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { RiAddCircleFill } from "react-icons/ri";

import { cn } from "@/lib/utils";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { useSetProject } from "@/features/projects/api/use-set-project";

export const Projects = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { open } = useCreateProjectModal();
  const workspaceId = useWorkspaceId();
  const { data } = useGetProjects({ workspaceId });
  const { mutate: setProject } = useSetProject();

  // Скрываем кнопку создания для обычных пользователей
  const isRegularUser = workspaceId === 'default-workspace';

  const handleProjectClick = (projectId: string) => {
    // Вызываем API для установки проекта
    setProject(projectId);
    
    // Затем переходим на страницу проекта
    const href = `/workspaces/${workspaceId}/projects/${projectId}`;
    router.push(href);
  };

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-neutral-500">Projects</p>
        {!isRegularUser && (
          <RiAddCircleFill
            className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition"
            onClick={open}
          />
        )}
      </div>
      {data?.documents.map((project) => {
        const href = `/workspaces/${workspaceId}/projects/${project.$id}`;
        const isActive = pathname === href;

        return (
          <div
            key={project.$id}
            onClick={() => handleProjectClick(project.$id)}
            className={cn(
              "flex items-center gap-2.5 p-2.5 rounded-md hover:opacity-75 transition cursor-pointer text-neutral-500",
              isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
            )}
          >
            <ProjectAvatar image={project.imageUrl} name={project.name} />
            <span className="truncate">{project.name}</span>
          </div>
        );
      })}
    </div>
  );
};
