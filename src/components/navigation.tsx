"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { SettingsIcon, UsersIcon } from "lucide-react";
import {
  GoCheckCircle,
  GoCheckCircleFill,
  GoHome,
  GoHomeFill,
} from "react-icons/go";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

export const Navigation = () => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();
  
  // Определяем, является ли пользователь обычным
  const isRegularUser = workspaceId === 'default-workspace';

  const routes = [
    { label: "Home", href: "", icon: GoHome, activeIcon: GoHomeFill, showForRegular: true },
    {
      label: "My Tasks",
      href: "/tasks",
      icon: GoCheckCircle,
      activeIcon: GoCheckCircleFill,
      showForRegular: true,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: SettingsIcon,
      activeIcon: SettingsIcon,
      showForRegular: false,
    },
    {
      label: "Members",
      href: "/members",
      icon: UsersIcon,
      activeIcon: UsersIcon,
      showForRegular: false,
    },
  ];

  // Фильтруем маршруты для обычных пользователей
  const filteredRoutes = isRegularUser 
    ? routes.filter(route => route.showForRegular)
    : routes;

  return (
    <ul className="flex flex-col">
      {filteredRoutes.map((item) => {
        const fullHref = `/workspaces/${workspaceId}${item.href}`;
        const isActive = pathname === fullHref;
        const Icon = isActive ? item.activeIcon : item.icon;

        return (
          <Link key={item.href} href={fullHref}>
            <div
              className={cn(
                "flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-neutral-500",
                isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
              )}
            >
              <Icon className="size-5 text-neutral-500" />
              {item.label}
            </div>
          </Link>
        );
      })}
    </ul>
  );
};
