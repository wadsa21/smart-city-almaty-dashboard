# Smart City Management Dashboard (Almaty)

MVP-прототип системы мониторинга города с использованием ИИ.

## 🚀 Функционал
- **Экология:** Мониторинг воздуха в реальном времени через OpenWeather API по 8 районам Алматы.
- **ЖКХ:** Мониторинг состояния сетей (давление воды, нагрузка) на базе Mock-данных.
- **AI/ML:** Оценка рисков аварий и загрязнения с использованием Scikit-Learn (Random Forest).
- **Интерактивая панель:** Рекомендации по формату "Что произошло? -> Критичность -> Действие".

## 🛠 Технологии
- **Frontend:** React, Tailwind CSS, Lucide Icons, Recharts.
- **Backend:** Python, FastAPI, Scikit-Learn, Requests.

## 📦 Запуск
1. **Backend:** `cd backend && pip install -r requirements.txt && python main.py`
2. **Frontend:** `cd frontend && npm install && npm start`