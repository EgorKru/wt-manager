import { Models } from "@/lib/api-types";

export type Project = Models.Document & {
  name: string;
  imageUrl: string;
  workspaceId: string;
};
