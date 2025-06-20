// Типы для совместимости с AppWriter
export namespace Models {
  export interface Document {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    [key: string]: any;
  }
  
  export interface User<T = any> {
    $id: string;
    name: string;
    email: string;
    $createdAt: string;
    prefs?: T;
  }

  export interface Preferences {
    [key: string]: any;
  }
}

// Утилиты для работы с запросами (совместимость с AppWriter Query)
export class Query {
  static equal(attribute: string, value: any): string {
    return `equal("${attribute}", "${value}")`;
  }

  static notEqual(attribute: string, value: any): string {
    return `notEqual("${attribute}", "${value}")`;
  }

  static orderDesc(attribute: string): string {
    return `orderDesc("${attribute}")`;
  }

  static orderAsc(attribute: string): string {
    return `orderAsc("${attribute}")`;
  }

  static contains(attribute: string, values: string[]): string {
    return `contains("${attribute}", [${values.map(v => `"${v}"`).join(', ')}])`;
  }

  static limit(count: number): string {
    return `limit(${count})`;
  }

  static offset(count: number): string {
    return `offset(${count})`;
  }

  static search(attribute: string, term: string): string {
    return `search("${attribute}", "${term}")`;
  }

  static select(attributes: string[]): string {
    return `select([${attributes.map(attr => `"${attr}"`).join(', ')}])`;
  }

  static greaterThan(attribute: string, value: any): string {
    return `greaterThan("${attribute}", "${value}")`;
  }

  static greaterThanEqual(attribute: string, value: any): string {
    return `greaterThanEqual("${attribute}", "${value}")`;
  }

  static lessThan(attribute: string, value: any): string {
    return `lessThan("${attribute}", "${value}")`;
  }

  static lessThanEqual(attribute: string, value: any): string {
    return `lessThanEqual("${attribute}", "${value}")`;
  }
}

// Генератор уникальных ID (совместимость с AppWriter ID.unique())
export class ID {
  static unique(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Enum для OAuth провайдеров (если понадобится)
export enum OAuthProvider {
  Github = "github",
  Google = "google",
  Facebook = "facebook",
}

// Enum для ролей участников
export enum MemberRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

// Enum для статусов задач
export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE",
} 