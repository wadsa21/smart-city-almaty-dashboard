🏙️ Smart City Almaty: Unified AI Dashboard
Интеллектуальная система управления городскими ресурсами Алматы.
Проект объединяет мониторинг ЖКХ, анализ трафика и контроль качества воздуха (AQI) в одном интерфейсе с использованием гибридного ИИ.

🚀 Ссылки (Production)
Frontend (React): https://твой-проект.vercel.app

Backend (FastAPI): https://smart-city-almaty-dashboard.onrender.com

🧠 Технологический стек
Frontend: React, Vite, Tailwind CSS (Dashboard UI).

Backend: FastAPI, Python 3.10+.

AI/ML: * Nano Banano Pro (RandomForest): Локальная ML-модель для мгновенной классификации рисков ЖКХ.

Google Gemini 2.0 Flash: Генерация экспертных рекомендаций для диспетчера.

Data Sources: OpenWeather Air Pollution API, TomTom Traffic API.

🛠️ Архитектура системы
Ingestion: Сбор данных с датчиков и API (Трафик, Экология, Статус сетей).

Processing: Локальный ML-движок анализирует данные и выставляет статус риска.

Intelligence: Если риск критический, данные передаются в Gemini 2.0 для составления пошагового плана устранения аварии.

Delivery: Диспетчер получает готовое решение на дашборд.

💻 Локальный запуск
Backend
Bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Для Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
Frontend
Bash
cd frontend
npm install
npm run dev