import type { UserData } from '../api/types';

/**
 * Утилиты для сохранения данных пользователя в localStorage
 */

export function saveUserData(userData: UserData): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('user-data', JSON.stringify(userData));
  }
}

export function getUserData(): UserData | null {
  if (typeof localStorage !== 'undefined') {
    const data = localStorage.getItem('user-data');
    return data ? JSON.parse(data) : null;
  }
  return null;
}

export function clearUserData(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('user-data');
  }
} 