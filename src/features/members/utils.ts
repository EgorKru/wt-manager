import { DATABASE_ID, MEMBERS_ID } from "@/config";
import { Query } from "@/lib/api-types";

interface DatabasesType {
  listDocuments<T>(databaseId: string, collectionId: string, queries?: any[]): Promise<{ total: number; documents: T[] }>;
}

interface GetMemberProps {
  databases: DatabasesType;
  workspaceId: string;
  userId: string;
}

export const getMember = async ({
  databases,
  userId,
  workspaceId,
}: GetMemberProps) => {
  const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
    Query.equal("workspaceId", workspaceId),
    Query.equal("userId", userId),
  ]);

  return members.documents[0];
};
