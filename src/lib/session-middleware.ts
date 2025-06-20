import "server-only";

import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { ACCESS_TOKEN_COOKIE } from "@/features/auth/constants";
import { createSessionClient } from "./appwrite";

// Типы для совместимости
interface User {
  $id: string;
  name: string;
  email: string;
  $createdAt: string;
}

// Адаптеры для совместимости с AppWriter API
interface AccountType {
  get(): Promise<User>;
}

interface DatabasesType {
  listDocuments<T>(databaseId: string, collectionId: string, queries?: any[]): Promise<{ total: number; documents: T[] }>;
  createDocument<T>(databaseId: string, collectionId: string, documentId: string, data: any): Promise<T>;
  updateDocument<T>(databaseId: string, collectionId: string, documentId: string, data: any): Promise<T>;
  deleteDocument(databaseId: string, collectionId: string, documentId: string): Promise<void>;
  getDocument<T>(databaseId: string, collectionId: string, documentId: string): Promise<T>;
}

interface StorageType {
  createFile(bucketId: string, fileId: string, file: File): Promise<{ $id: string }>;
  getFilePreview(bucketId: string, fileId: string): Promise<ArrayBuffer>;
}

interface UsersType {
  get(userId: string): Promise<User>;
}

type AdditionalContext = {
  Variables: {
    account: AccountType;
    databases: DatabasesType;
    storage: StorageType;
    users: UsersType;
    user: User;
  };
};

export const sessionMiddleware = createMiddleware<AdditionalContext>(
  async (c, next) => {
    try {
      const accessToken = getCookie(c, ACCESS_TOKEN_COOKIE);

      if (!accessToken) {
        return c.json({ error: "Unauthorized - no access token" }, 401);
      }

      // Создаем клиенты через наш адаптер
      const sessionClient = await createSessionClient();
      const user = await sessionClient.account.get();

      // Создаем admin клиент для users
      const adminClient = await (await import("./appwrite")).createAdminClient();
      
      // Устанавливаем переменные контекста
      c.set("account", sessionClient.account);
      c.set("databases", sessionClient.databases);
      c.set("storage", sessionClient.storage);
      c.set("users", adminClient.users);
      c.set("user", user);

      await next();
    } catch (error) {
      console.error("Session middleware error:", error);
      return c.json({ error: "Unauthorized" }, 401);
    }
  }
);
