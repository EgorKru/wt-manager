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
    try {
      // Обрабатываем запросы к проектам
      if (collectionId === 'projects') {
        // Получаем workspaceId из queries
        const workspaceIdQuery = queries.find(q => q.includes('workspaceId'));
        const workspaceId = workspaceIdQuery ? workspaceIdQuery.split('"')[1] : null;
        
        // Для обычных пользователей игнорируем workspaceId и получаем все их проекты
        const projects = await apiClient.getUserProjects();
        
        // Преобразуем ответ в формат AppWrite
        const documents = (projects || []).map((project: any) => ({
          $id: project.projectId,
          $createdAt: project.createdAt || new Date().toISOString(),
          $updatedAt: project.updatedAt || new Date().toISOString(),
          name: project.projectName,
          workspaceId: workspaceId || 'default-workspace', // Используем default для обычных пользователей
          imageUrl: project.imageUrl || project.image,
          projectId: project.projectId,
          projectName: project.projectName,
        }));
        
        return {
          total: documents.length,
          documents: documents as T[],
        };
      }

      // Обрабатываем запросы к workspaces
      if (collectionId === 'workspaces') {
        // Для обычных пользователей возвращаем фиктивный workspace
        const defaultWorkspace = {
          $id: 'default-workspace',
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString(),
          name: 'My Projects',
          userId: 'current-user',
          inviteCode: null,
          imageUrl: null,
        };
        
        return {
          total: 1,
          documents: [defaultWorkspace] as T[],
        };
      }

      // Обрабатываем запросы к members  
      if (collectionId === 'members') {
        // Для обычных пользователей возвращаем пустой список
        return {
          total: 0,
          documents: [],
        };
      }

      // Обрабатываем запросы к задачам
      if (collectionId === 'tasks') {
        // TODO: Реализовать когда будет endpoint для получения задач пользователя
        // Пока возвращаем пустой список
        return {
          total: 0,
          documents: [],
        };
      }
      
      // Для остальных коллекций пока возвращаем пустой результат
      console.log('List documents:', { databaseId, collectionId, queries });
      return {
        total: 0,
        documents: [],
      };
    } catch (error) {
      console.error('Error listing documents:', error);
      return {
        total: 0,
        documents: [],
      };
    }
  }

  async createDocument<T = Document>(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: any
  ): Promise<T> {
    try {
      // Обрабатываем создание проекта
      if (collectionId === 'projects') {
        const createdProject = await apiClient.createProject({
          name: data.name,
          description: data.description || '',
          // Добавьте другие поля в соответствии с вашим API
        });
        
        // Преобразуем ответ в формат AppWrite
        return {
          $id: createdProject.id || createdProject.projectId || documentId,
          $createdAt: createdProject.createdAt || new Date().toISOString(),
          $updatedAt: createdProject.updatedAt || new Date().toISOString(),
          name: createdProject.name || createdProject.projectName,
          workspaceId: data.workspaceId,
          imageUrl: data.imageUrl,
          ...createdProject,
        } as T;
      }
      
      // Для остальных коллекций временная заглушка
      console.log('Create document:', { databaseId, collectionId, documentId, data });
      return {
        $id: documentId,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        ...data,
      } as T;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  async updateDocument<T = Document>(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: any
  ): Promise<T> {
    // TODO: Реализовать когда будут endpoints для обновления проектов
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
    // TODO: Реализовать когда будут endpoints для удаления проектов
    console.log('Delete document:', { databaseId, collectionId, documentId });
  }

  async getDocument<T = Document>(
    databaseId: string,
    collectionId: string,
    documentId: string
  ): Promise<T> {
    try {
      // Обрабатываем получение проекта по ID
      if (collectionId === 'projects') {
        // Пока используем список проектов и ищем по ID
        const projects = await apiClient.getUserProjects();
        const project = projects.find((p: any) => 
          p.id === documentId || p.projectId === documentId
        );
        
        if (!project) {
          throw new Error('Project not found');
        }
        
        // Преобразуем ответ в формат AppWrite
        return {
          $id: project.projectId,
          $createdAt: project.createdAt || new Date().toISOString(),
          $updatedAt: project.updatedAt || new Date().toISOString(),
          name: project.projectName,
          workspaceId: 'default-workspace',
          imageUrl: project.imageUrl || project.image,
          projectId: project.projectId,
          projectName: project.projectName,
        } as T;
      }

      // Обрабатываем получение workspace по ID
      if (collectionId === 'workspaces' && documentId === 'default-workspace') {
        // Возвращаем фиктивный workspace для обычных пользователей
        return {
          $id: 'default-workspace',
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString(),
          name: 'My Projects',
          userId: 'current-user',
          inviteCode: null,
          imageUrl: null,
        } as T;
      }
      
      // Для остальных коллекций временная заглушка
      console.log('Get document:', { databaseId, collectionId, documentId });
      return {
        $id: documentId,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
      } as T;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
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
