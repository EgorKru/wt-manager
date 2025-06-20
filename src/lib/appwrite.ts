import "server-only";

import { cookies } from "next/headers";
import { apiClient } from "./api-client";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/features/auth/constants";

// Типы для совместимости с AppWriter
interface User {
  $id: string;
  name: string;
  email: string;
  $createdAt: string;
}

interface Document {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  [key: string]: any;
}

interface ListResult<T = Document> {
  total: number;
  documents: T[];
}

// Адаптер для Account (имитирует AppWriter Account)
class AccountAdapter {
  async get(): Promise<User> {
    try {
      const user = await apiClient.getCurrentUser();
      // Преобразовываем ответ в формат AppWriter
      return {
        $id: user.id || user.userId || 'temp-id',
        name: user.name || user.username || 'User',
        email: user.email || user.username || 'user@example.com',
        $createdAt: user.createdAt || new Date().toISOString(),
      };
    } catch (error) {
      throw new Error("Failed to get current user");
    }
  }

  async createEmailPasswordSession(email: string, password: string) {
    const response = await apiClient.login(email, password);
    return {
      secret: response.accessToken,
      userId: 'temp-user-id', // TODO: получать из ответа когда будет endpoint для user info
    };
  }

  async create(id: string, email: string, password: string, name: string) {
    // TODO: Реализовать когда будет endpoint для регистрации
    console.log('Register:', { id, email, password, name });
    throw new Error("Registration endpoint not implemented yet");
  }

  async deleteSession(sessionId: string) {
    // TODO: Реализовать когда будет endpoint для logout
    console.log('Logout session:', sessionId);
    return { success: true };
  }

  async createSession(userId: string, secret: string) {
    // Для OAuth - пока заглушка
    return { secret };
  }
}

// Адаптер для Databases (имитирует AppWriter Databases)
class DatabasesAdapter {
  async listDocuments<T = Document>(
    databaseId: string,
    collectionId: string,
    queries: any[] = []
  ): Promise<ListResult<T>> {
    // TODO: Реализовать когда будут endpoints
    console.log('List documents:', { databaseId, collectionId, queries });
    
    // Временная заглушка
    return {
      total: 0,
      documents: [],
    };
  }

  async createDocument<T = Document>(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: any
  ): Promise<T> {
    // TODO: Реализовать когда будут endpoints
    console.log('Create document:', { databaseId, collectionId, documentId, data });
    
    // Временная заглушка
    return {
      $id: documentId,
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
      ...data,
    } as T;
  }

  async updateDocument<T = Document>(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: any
  ): Promise<T> {
    // TODO: Реализовать когда будут endpoints
    console.log('Update document:', { databaseId, collectionId, documentId, data });
    
    // Временная заглушка
    return {
      $id: documentId,
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
      ...data,
    } as T;
  }

  async deleteDocument(databaseId: string, collectionId: string, documentId: string): Promise<void> {
    // TODO: Реализовать когда будут endpoints
    console.log('Delete document:', { databaseId, collectionId, documentId });
  }

  async getDocument<T = Document>(
    databaseId: string,
    collectionId: string,
    documentId: string
  ): Promise<T> {
    // TODO: Реализовать когда будут endpoints
    console.log('Get document:', { databaseId, collectionId, documentId });
    
    // Временная заглушка
    return {
      $id: documentId,
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
    } as T;
  }
}

// Адаптер для Storage (для работы с файлами)
class StorageAdapter {
  async createFile(bucketId: string, fileId: string, file: File) {
    // TODO: Реализовать когда будет endpoint для загрузки файлов
    console.log('Create file:', { bucketId, fileId, fileName: file.name });
    return { $id: fileId };
  }

  async getFilePreview(bucketId: string, fileId: string) {
    // TODO: Реализовать когда будет endpoint для получения файлов
    console.log('Get file preview:', { bucketId, fileId });
    return new ArrayBuffer(0);
  }
}

// Адаптер для Users (админские функции)
class UsersAdapter {
  async get(userId: string): Promise<User> {
    // TODO: Реализовать когда будет endpoint для получения пользователя по ID
    console.log('Get user:', userId);
    
    // Временная заглушка
    return {
      $id: userId,
      name: 'User',
      email: 'user@example.com',
      $createdAt: new Date().toISOString(),
    };
  }
}

export async function createSessionClient() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE);

  if (!accessToken || !accessToken.value) {
    throw new Error("Unauthorized");
  }

  return {
    get account() {
      return new AccountAdapter();
    },
    get databases() {
      return new DatabasesAdapter();
    },
    get storage() {
      return new StorageAdapter();
    },
  };
}

export async function createAdminClient() {
  return {
    get account() {
      return new AccountAdapter();
    },
    get users() {
      return new UsersAdapter();
    },
    get databases() {
      return new DatabasesAdapter();
    },
    get storage() {
      return new StorageAdapter();
    },
  };
}
