#!/bin/bash
# 🚀 Быстрый деплой INZZO на Vercel

echo "🎨 INZZO - Деплой на Vercel"
echo "=============================="
echo ""

# Проверка Vercel CLI
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI не установлен"
    echo "📦 Устанавливаем Vercel CLI..."
    sudo npm i -g vercel
fi

echo "✅ Vercel CLI установлен"
echo ""

# Переход в директорию проекта
cd "$(dirname "$0")"

echo "📋 Для деплоя вам понадобится:"
echo "   1. Токен Telegram бота (от @BotFather)"
echo "   2. Ваш Chat ID (от @userinfobot)"
echo ""

read -p "У вас есть эти данные? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo "📱 Получите данные:"
    echo "   1. Telegram бот: https://t.me/BotFather"
    echo "   2. Chat ID: https://t.me/userinfobot"
    echo ""
    exit 1
fi

echo ""
echo "🚀 Запускаем деплой..."
echo ""

# Деплой
vercel

echo ""
echo "✅ Деплой завершен!"
echo ""
echo "📝 Следующие шаги:"
echo "   1. Добавьте переменные окружения:"
echo "      vercel env add TELEGRAM_BOT_TOKEN"
echo "      vercel env add TELEGRAM_CHAT_ID"
echo ""
echo "   2. Запустите продакшн деплой:"
echo "      vercel --prod"
echo ""
