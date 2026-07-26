import asyncio
import json
import base64
import logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder

# Конфигурация
BOT_TOKEN = "8283504947:AAEl7JGmgtCx5q4xihUXFda7Luie3Nbcu1A"  # Токен бота
MY_CHAT_ID = 8579101084  # ID администратора
MINI_APP_URL = "https://wecstor1.github.io/Liuybotyn-miniapp/"  # URL Mini App

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Инициализация бота и диспетчера
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    """Обработчик команды /start с кнопкой Mini App"""
    keyboard = InlineKeyboardBuilder()
    
    # Создаем кнопку с WebAppInfo
    webapp_button = InlineKeyboardButton(
        text="💌 Написать анонимное сообщение",
        web_app=WebAppInfo(url=MINI_APP_URL)
    )
    keyboard.add(webapp_button)
    
    await message.answer(
        "👋 Привет! Добро пожаловать в люботин!\n\n"
        "Нажми на кнопку ниже, чтобы отправить анонимное сообщение.",
        reply_markup=keyboard.as_markup()
    )


@dp.message(F.web_app_data)
async def handle_web_app_data(message: types.Message):
    """Обработчик данных из Mini App"""
    try:
        logger.info(f"Получены web_app_data от пользователя {message.from_user.id}")
        logger.info(f"Данные: {message.web_app_data.data}")
        
        # Парсим JSON данные из Mini App
        data = json.loads(message.web_app_data.data)
        
        text = data.get('text', '')
        file_data = data.get('file', None)
        
        logger.info(f"Текст сообщения: {text}")
        logger.info(f"Файл: {file_data is not None}")
        
        # Отправляем подтверждение пользователю
        await message.answer("✅ Твоё анонимное сообщение успешно отправлено!")
        
        # Формируем информацию об отправителе
        user = message.from_user
        sender_info = (
            f"👤 <b>Информация об отправителе:</b>\n"
            f"🆔 ID: <code>{user.id}</code>\n"
            f"👤 Имя: {user.first_name or 'Не указано'}"
        )
        
        if user.last_name:
            sender_info += f" {user.last_name}"
        
        if user.username:
            sender_info += f"\n🔗 Username: @{user.username}"
        else:
            sender_info += "\n🔗 Username: Не указан"
        
        sender_info += "\n" + "─" * 30 + "\n"
        
        logger.info(f"Отправка администратору (ID: {MY_CHAT_ID})")
        
        # Отправляем администратору
        await send_to_admin(text, file_data, sender_info)
        
        logger.info(f"Сообщение от пользователя {user.id} успешно отправлено администратору")
        
    except json.JSONDecodeError as e:
        logger.error(f"Ошибка декодирования JSON из Mini App: {e}")
        await message.answer("❌ Произошла ошибка при обработке сообщения.")
    except Exception as e:
        logger.error(f"Ошибка при обработке web_app_data: {e}")
        import traceback
        logger.error(traceback.format_exc())
        await message.answer("❌ Произошла ошибка. Попробуйте еще раз.")


async def send_to_admin(text: str, file_data: dict, sender_info: str):
    """Отправка сообщения администратору"""
    try:
        # Формируем сообщение для администратора
        admin_message = f"{sender_info}💬 <b>Сообщение:</b>\n{text}"
        
        # Если есть вложение, обрабатываем его
        if file_data:
            file_name = file_data.get('name', 'file')
            file_type = file_data.get('type', '')
            file_base64 = file_data.get('data', '')
            
            logger.info(f"Получен файл: {file_name}, тип: {file_type}")
            
            # Декодируем base64 - убираем data URL префикс если есть
            if ',' in file_base64:
                file_bytes = base64.b64decode(file_base64.split(',')[1])
            else:
                file_bytes = base64.b64decode(file_base64)
            
            logger.info(f"Размер файла: {len(file_bytes)} байт")
            
            # Определяем тип файла и отправляем соответствующим методом
            if file_type.startswith('image/'):
                from aiogram.types import BufferedInputFile
                input_file = BufferedInputFile(file_bytes, filename=file_name)
                await bot.send_photo(MY_CHAT_ID, input_file, caption=admin_message, parse_mode="HTML")
                logger.info("Фото отправлено администратору")
            elif file_type.startswith('video/'):
                from aiogram.types import BufferedInputFile
                input_file = BufferedInputFile(file_bytes, filename=file_name)
                await bot.send_video(MY_CHAT_ID, input_file, caption=admin_message, parse_mode="HTML")
                logger.info("Видео отправлено администратору")
            else:
                # Если файл не изображение и не видео, отправляем как документ
                from aiogram.types import BufferedInputFile
                input_file = BufferedInputFile(file_bytes, filename=file_name)
                await bot.send_document(MY_CHAT_ID, input_file, caption=admin_message, parse_mode="HTML")
                logger.info("Документ отправлен администратору")
        else:
            # Если нет вложения, отправляем только текст
            await bot.send_message(MY_CHAT_ID, admin_message, parse_mode="HTML")
            logger.info("Текстовое сообщение отправлено администратору")
        
        logger.info("Сообщение успешно отправлено администратору")
        
    except Exception as e:
        logger.error(f"Ошибка при отправке администратору: {e}")
        import traceback
        logger.error(traceback.format_exc())


async def main():
    """Запуск бота"""
    logger.info("Бот запускается...")
    
    # Удаляем вебхуки, если были установлены
    await bot.delete_webhook(drop_pending_updates=True)
    
    # Запускаем поллинг
    await dp.start_polling(bot)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Бот остановлен")
    except Exception as e:
        logger.error(f"Критическая ошибка: {e}")
