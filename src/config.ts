// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://91.211.249.37/test";
export const API_VERSION = "/work-task/v1";

// Collection names (keeping same structure as before)
export const DATABASE_ID = "main"; // не используется для REST API, но оставляем для совместимости
export const WORKSPACES_ID = "workspaces";
export const IMAGES_BUCKET_ID = "images";
export const MEMBERS_ID = "members";
export const PROJECTS_ID = "projects";
export const TASKS_ID = "tasks";
