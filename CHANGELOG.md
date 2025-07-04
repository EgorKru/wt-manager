# 📝 История изменений

Все важные изменения в проекте документируются в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
и проект следует [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Добавлено
- 🎯 Современный UI в стиле Jira
- 🔐 JWT аутентификация с автоматическим обновлением токенов
- 📊 Kanban доска с drag-and-drop функциональностью
- 👥 Система ролей пользователей (Admin, Owner, Regular User)
- 📱 Адаптивный дизайн для мобильных устройств
- ⚡ Оптимизация производительности с React Query

### Изменено
- 🏗️ Полная миграция с AppWrite на внешний REST API
- 📁 Реструктуризация кода в модульную архитектуру
- 🎨 Обновление UI компонентов с shadcn/ui

### Исправлено
- 🐛 Проблема с бесконечными редиректами на дашборде
- 🍪 Исправление сохранения cookies в localhost
- 🔄 Дублирование API запросов при обновлении статуса задач

### Удалено
- 📦 Статус BACKLOG из системы задач
- 🗑️ Неиспользуемые AppWrite зависимости

## [1.0.0] - 2024-01-XX

### Добавлено
- 🚀 Первый релиз Work Task Manager
- 🔌 Интеграция с внешним API
- 📋 Базовая функциональность управления задачами
- 🏢 Система проектов и рабочих областей

---

## Типы изменений

- `Добавлено` - для новых функций
- `Изменено` - для изменений в существующей функциональности  
- `Устарело` - для функций, которые скоро будут удалены
- `Удалено` - для удаленных функций
- `Исправлено` - для исправления багов
- `Безопасность` - для уязвимостей безопасности 