# 🔌 API Документация

Документация по интеграции с внешним API для Work Task Manager.

## 🌐 Базовая информация

- **Base URL**: `http://91.211.249.37/test`
- **API Version**: `/work-task/v1`
- **Аутентификация**: JWT Bearer Token
- **Формат данных**: JSON

## 🔐 Аутентификация

### Вход в систему
```http
POST /auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Ответ:**
```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

### Обновление токена
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "string"
}
```

**Ответ:**
```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

## 📁 Проекты

### Получение проектов пользователя
```http
GET /projects/users-projects
Authorization: Bearer {accessToken}
```

**Ответ:**
```json
[
  {
    "projectId": "string",
    "projectName": "string",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "imageUrl": "string"
  }
]
```

### Создание проекта
```http
POST /projects/create-project
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "string",
  "description": "string"
}
```

### Установка активного проекта
```http
POST /projects/set-project/{projectId}
Authorization: Bearer {accessToken}
```

**Ответ - список задач проекта:**
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "priority": "BLOCKER" | "HIGH" | "MEDIUM" | "LOW",
    "creator": "string",
    "assignee": "string",
    "projectId": "string",
    "sprintId": "string",
    "taskType": "TASK" | "BUG" | "FEATURE",
    "estimation": 0,
    "status": "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE",
    "creationDate": "2024-01-01T00:00:00.000Z",
    "updateDate": "2024-01-01T00:00:00.000Z",
    "code": "string",
    "position": 1000
  }
]
```

## 📋 Задачи

### Обновление статуса задачи
```http
PUT /task/update-status
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "code": "string",
  "status": "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE"
}
```

## 🔄 Статусы задач

| Статус | Описание |
|--------|----------|
| `TODO` | Задача в очереди |
| `IN_PROGRESS` | Задача в работе |
| `REVIEW` | Задача на проверке |
| `DONE` | Задача завершена |

## 🎯 Приоритеты задач

| Приоритет | Описание |
|-----------|----------|
| `BLOCKER` | Блокирующая задача |
| `HIGH` | Высокий приоритет |
| `MEDIUM` | Средний приоритет |
| `LOW` | Низкий приоритет |

## 📝 Типы задач

| Тип | Описание |
|-----|----------|
| `TASK` | Обычная задача |
| `BUG` | Исправление бага |
| `FEATURE` | Новая функция |

## ⚠️ Обработка ошибок

### Коды ошибок

| Код | Описание |
|-----|----------|
| `400` | Неверный запрос |
| `401` | Не авторизован |
| `403` | Доступ запрещен |
| `404` | Ресурс не найден |
| `500` | Внутренняя ошибка сервера |

### Формат ошибки
```json
{
  "error": "string",
  "message": "string",
  "statusCode": 400
}
```

## 🔧 Примеры использования

### Полный цикл работы с задачей

1. **Авторизация**
   ```javascript
   const response = await fetch('/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ username, password })
   });
   ```

2. **Получение проектов**
   ```javascript
   const projects = await fetch('/projects/users-projects', {
     headers: { 'Authorization': `Bearer ${accessToken}` }
   });
   ```

3. **Установка проекта и получение задач**
   ```javascript
   const tasks = await fetch(`/projects/set-project/${projectId}`, {
     method: 'POST',
     headers: { 'Authorization': `Bearer ${accessToken}` }
   });
   ```

4. **Обновление статуса задачи**
   ```javascript
   await fetch('/task/update-status', {
     method: 'PUT',
     headers: { 
       'Authorization': `Bearer ${accessToken}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({ code: taskCode, status: 'IN_PROGRESS' })
   });
   ```

## 🛡️ Безопасность

- Все запросы должны содержать валидный JWT токен
- Токены имеют ограниченное время жизни
- Используйте HTTPS в продакшене
- Не храните токены в localStorage (используйте httpOnly cookies)

## 📊 Rate Limiting

- Лимит: 100 запросов в минуту на пользователя
- При превышении: HTTP 429 Too Many Requests
- Заголовки ответа содержат информацию о лимитах 