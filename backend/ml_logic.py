from sklearn.ensemble import RandomForestClassifier
import numpy as np

class SmartCityML:
    def __init__(self):
        # Инициализируем модель (Random Forest идеально подходит для классификации состояний)
        self.model = RandomForestClassifier(n_estimators=50, random_state=42)
        self._train_initial_model()

    def _train_initial_model(self):
        """
        Обучение на синтетических данных (имитация исторической базы города).
        Признаки: [Давление (bar), Нагрузка (%), Износ сетей (%)]
        """
        X_train = np.array([
            [4.0, 30, 10], [4.2, 25, 5],   # 0: Все отлично
            [3.5, 50, 30], [3.2, 55, 40],  # 0: Норма
            [2.5, 75, 65], [2.1, 80, 70],  # 1: Внимание (Риск)
            [1.2, 90, 85], [0.8, 95, 90],  # 2: Критично (Авария)
            [0.5, 98, 95]                  # 2: Авария
        ])
        
        # Таргет: 0-ОК, 1-Warning, 2-Critical
        y_train = np.array([0, 0, 0, 0, 1, 1, 2, 2, 2])
        self.model.fit(X_train, y_train)

    def predict_utility_risk(self, pressure, load, wear):
        """Возвращает уровень риска на основе текущих показателей датчиков"""
        prediction = self.model.predict([[pressure, load, wear]])[0]
        
        risk_map = {
            0: {"status": "Stable", "level": "Низкий"},
            1: {"status": "Warning", "level": "Средний"},
            2: {"status": "Critical", "level": "Высокий"}
        }
        return risk_map[prediction]

    def predict_air_trend(self, current_aqi, hour):
        """
        Простая логика прогноза: если час пик (8:00 или 18:00) и AQI > 2, 
        прогнозируем ухудшение.
        """
        if hour in [8, 9, 18, 19, 20] and current_aqi >= 3:
            return "Прогноз: Ухудшение из-за трафика"
        return "Прогноз: Стабильно"

# Создаем экземпляр для импорта
engine = SmartCityML()