# Анонимное послание - Telegram Mini App

Современное и стильное Telegram Mini App для отправки анонимных сообщений с возможностью прикрепления фото и видео.

## Особенности

- 🎨 **Современный дизайн** - Минималистичный интерфейс с поддержкой темной темы
- 🌙 **Темная тема** - Автоматическая адаптация под тему Telegram пользователя
- 📝 **Удобный ввод** - Плавное поле ввода с подсказкой и счетчиком символов (максимум 500)
- 📎 **Вложения** - Возможность прикреплять фото и видео к сообщениям
- ✨ **Анимации** - Красивая анимация успешной отправки с галочкой
- 🔗 **Поддержка** - Кнопка поддержки со ссылкой на профиль @wecstor
- 📱 **Telegram Native** - Полная интеграция с Telegram Web App API

## Структура файлов

```
lyubotin/
├── index.html    # Основной HTML файл
├── styles.css    # Стили с Telegram CSS переменными
├── script.js     # Логика приложения
└── README.md     # Документация
```

## Развертывание

### 1. Загрузка файлов

Загрузите все файлы на ваш веб-сервер или хостинг (GitHub Pages, Vercel, Netlify и т.д.).

### 2. Настройка Telegram бота

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен бота
3. Установите Webhook для обработки данных от Mini App

### 3. Настройка Mini App в Telegram

1. Перейдите в [@BotFather](https://t.me/BotFather)
2. Выберите вашего бота
3. Используйте команду `/newapp`
4. Следуйте инструкциям для создания Mini App
5. Укажите URL вашего развернутого приложения

### 4. Обработка данных на сервере

При отправке сообщения бот получает JSON с данными:

```json
{
  "text": "Текст сообщения",
  "file": {
    "name": "filename.jpg",
    "type": "image/jpeg",
    "size": 12345,
    "data": "base64_encoded_file"
  }
}
```

Пример обработки на Python (aiogram):

```python
from aiogram import Bot, Dispatcher, types
import json
import base64

bot = Bot(token="YOUR_BOT_TOKEN")
dp = Dispatcher(bot)

@dp.message_handler(content_types=['web_app_data'])
async def handle_web_app_data(message: types.Message):
    data = json.loads(message.web_app_data.data)
    text = data['text']
    
    if 'file' in data:
        file_data = base64.b64decode(data['file']['data'])
        # Обработка файла...
    
    await message.answer(f"Получено сообщение: {text}")
```

## Кастомизация

### Изменение ссылки поддержки

В файле `index.html` измените ссылку в футере:

```html
<a href="https://t.me/ВАШ_ЮЗЕРНЕЙМ" target="_blank" class="support-btn">
```

### Изменение лимита символов

В файле `index.html` измените атрибут `maxlength`:

```html
<textarea maxlength="500" ...>
```

И в файле `script.js` измените значение для предупреждения:

```javascript
if (currentLength >= 450) { // Измените 450 на нужное значение
```

## Технические детали

- Использует официальную библиотеку Telegram Web App
- CSS переменные для автоматической адаптации под тему
- Haptic feedback для тактильных ощущений
- Автоматическое расширение на полный экран
- Обработка изменений темы в реальном времени

## Лицензия

MIT License
