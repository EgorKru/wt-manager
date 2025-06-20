import { Models } from "@/lib/api-types";

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  REVIEW = "REVIEW",
  DONE = "DONE",
}

export type Task = Models.Document & {
  name: string;
  status: TaskStatus;
  workspaceId: string;
  assigneeId: string;
  projectId: string;
  position: number;
  dueDate: string;
  description?: string;
  code?: string; // Код задачи для API
  // Объекты для отображения в таблице
  project?: {
    $id: string;
    name: string;
    imageUrl?: string;
  };
  assignee?: {
    $id: string;
    name: string;
    email?: string;
  };
};
