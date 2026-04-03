import os
import numpy as np
import requests
from sklearn.ensemble import RandomForestClassifier
from dotenv import load_dotenv

load_dotenv()

class SmartCityML:
    def __init__(self):
        # 1. Классический ML (Random Forest) для предсказания рисков ЖКХ
        self.model = RandomForestClassifier(n_estimators=50, random_state=42)
        self._train_initial_model()
        
        # 2. Настройки Gemini API
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = "gemini-2.0-flash" # Самая быстрая модель из твоего списка

    def _train_initial_model(self):
        """Обучение на данных: [Давление, Нагрузка, Износ]"""
        X_train = np.array([
            [4.0, 30, 10], [4.2, 25, 5],   # 0: Stable
            [3.5, 50, 30], [3.2, 55, 40],  # 0: Stable
            [2.5, 75, 65], [2.1, 80, 70],  # 1: Warning
            [1.2, 90, 85], [0.8, 95, 90],  # 2: Critical
            [0.5, 98, 95]                  # 2: Critical
        ])
        y_train = np.array([0, 0, 0, 0, 1, 1, 2, 2, 2])
        self.model.fit(X_train, y_train)

    def predict_utility_risk(self, pressure, load, wear):
        """Возвращает статус на основе RandomForest"""
        prediction = self.model.predict([[pressure, load, wear]])[0]
        risk_map = {
            0: {"status": "Stable", "level": "Низкий"},
            1: {"status": "Warning", "level": "Средний"},
            2: {"status": "Critical", "level": "Высокий"}
        }
        return risk_map[prediction]

    async def get_ai_recommendation(self, category, district, metrics):
        """Запрос к Gemini с защитой от превышения лимитов (Quota)"""
        
        # Заранее подготовленные ответы на случай ошибки лимитов (как у тебя на скрине)
        fallbacks = {
            "traffic": "Рекомендуется оптимизация фаз светофоров на магистралях и временное ограничение въезда спецтехники в данный квадрат.",
            "utilities": "Зафиксирован риск износа. Рекомендуется направить мобильную бригаду для превентивной проверки узлов давления.",
            "ecology": "AQI выше нормы. Рекомендуется усилить полив дорог для снижения концентрации взвешенных частиц PM2.5."
        }

        if not self.api_key:
            return fallbacks.get(category, "Система работает в штатном режиме.")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
        
        prompt = f"""
        Ты — эксперт 'Smart City Almaty'. Категория: {category}. Район: {district}. Данные: {metrics}.
        Дай 2 конкретных совета диспетчеру (до 25 слов). Стиль: краткий, строгий.
        """

        payload = {"contents": [{"parts": [{"text": prompt}]}]}

        try:
            # Делаем запрос с таймаутом, чтобы бэкенд не вис
            response = requests.post(url, json=payload, timeout=7)
            
            if response.status_code == 200:
                res_data = response.json()
                return res_data['candidates'][0]['content']['parts'][0]['text'].strip()
            else:
                # Если 429 (Quota exceeded) или любая другая ошибка - отдаем заглушку
                return fallbacks.get(category, "Требуется повышенное внимание к показателям датчиков.")
        except Exception:
            return fallbacks.get(category, "Мониторинг продолжается в автономном режиме.")

engine = SmartCityML()