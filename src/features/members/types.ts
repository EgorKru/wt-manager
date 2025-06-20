import { Models, MemberRole } from "@/lib/api-types";

export { MemberRole };

export type Member = Models.Document & {
  userId: string;
  workspaceId: string;
  role: MemberRole;
  name: string;
  email: string;
};
