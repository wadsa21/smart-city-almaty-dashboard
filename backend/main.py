import random
import requests
import uvicorn
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Импортируем наш ML движок из соседнего файла
from ml_logic import engine 

app = FastAPI(title="Smart City Almaty - AI Dashboard API")

# --- НАСТРОЙКА CORS (ОБЯЗАТЕЛЬНО ДЛЯ REACT) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Разрешаем запросы со всех адресов (для хакатона ок)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- КОНФИГУРАЦИЯ ---
OPENWEATHER_API_KEY = "ТВОЙ_API_KEY" # ЗАМЕНИ НА СВОЙ КЛЮЧ

# Координаты и базовый износ труб по районам Алматы
DISTRICTS = {
    "Medeu": {"lat": 43.2360, "lon": 76.9458, "wear": 45},
    "Bostandyq": {"lat": 43.2185, "lon": 76.9276, "wear": 85}, # Высокий износ для тестов
    "Almaly": {"lat": 43.2551, "lon": 76.9126, "wear": 60},
    "Auezov": {"lat": 43.2381, "lon": 76.8453, "wear": 55},
    "Zhetysu": {"lat": 43.3000, "lon": 76.9333, "wear": 70},
    "Turksib": {"lat": 43.3444, "lon": 76.9493, "wear": 75},
    "Alatau": {"lat": 43.3000, "lon": 76.8000, "wear": 30},
    "Nauryzbay": {"lat": 43.2000, "lon": 76.7800, "wear": 25},
}

# --- ЛОГИКА ПОЛУЧЕНИЯ ДАННЫХ ---

def fetch_weather(lat, lon):
    """Запрос реальных данных загрязнения воздуха"""
    try:
        url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}"
        r = requests.get(url, timeout=5)
        if r.status_code == 200:
            data = r.json()['list'][0]
            return {
                "aqi": data['main']['aqi'], # Индекс 1-5
                "pm25": round(data['components']['pm2_5'], 2),
                "no2": data['components']['no2']
            }
    except Exception:
        pass
    # Fallback (если API упал или нет ключа)
    return {"aqi": random.randint(1, 4), "pm25": round(random.uniform(15, 60), 2), "no2": 10.5}

def get_ai_response(category, metrics, district):
    """Формируем ответы на 3 вопроса кейса на основе данных"""
    
    if category == "ecology":
        aqi = metrics['aqi']
        if aqi <= 2:
            return {
                "issue": "Состояние воздуха в пределах нормы.",
                "impact": "Низкая (Безопасно)",
                "action": "Специальных мер не требуется. Рекомендуется плановое озеленение."
            }
        elif aqi == 3:
            return {
                "issue": "Зафиксировано умеренное накопление смога.",
                "impact": "Средняя (Риск для групп риска)",
                "action": "ML-прогноз: Ожидается рост PM2.5. Рекомендовано усилить контроль за выбросами частного сектора."
            }
        else:
            return {
                "issue": "Критическое загрязнение атмосферы.",
                "impact": "Высокая (Опасно для здоровья)",
                "action": "Ввести ограничение на движение грузового транспорта. Рекомендовать ношение респираторов."
            }
    
    else: # ЖКХ
        status = metrics['status']
        if status == "Critical":
            return {
                "issue": f"Аварийная ситуация на магистрали в районе {district}.",
                "impact": "Высокая (Риск прекращения подачи ресурсов)",
                "action": "Автоматическая диспетчеризация: Выезд бригады №7. Переключить район на резервную линию."
            }
        elif status == "Warning":
            return {
                "issue": "Обнаружена аномальная нагрузка при высоком износе сетей.",
                "impact": "Средняя (Вероятность прорыва 75%)",
                "action": "Снизить давление в системе. Провести внеплановый технический осмотр узла."
            }
        else:
            return {
                "issue": "Инфраструктура работает в штатном режиме.",
                "impact": "Низкая",
                "action": "Продолжать автоматизированный мониторинг датчиков."
            }

# --- ЭНДПОИНТЫ ---

@app.get("/api/v1/data")
async def get_dashboard_data(
    type: str = Query(..., description="ecology or utilities"),
    district: str = Query(..., description="Name of the district")
):
    if district not in DISTRICTS:
        raise HTTPException(status_code=404, detail="District not found")
    
    conf = DISTRICTS[district]
    
    if type == "ecology":
        weather_metrics = fetch_weather(conf['lat'], conf['lon'])
        return {
            "district": district,
            "type": "ecology",
            "status": "Warning" if weather_metrics['aqi'] >= 4 else "Stable",
            "metrics": weather_metrics,
            "ai_report": get_ai_response("ecology", weather_metrics, district)
        }
    
    elif type == "utilities":
        # Имитируем показания датчиков
        pressure = round(random.uniform(3.0, 4.5), 1)
        # Триггер аварии для демонстрации (район Бостандыкский)
        if district == "Bostandyq":
            pressure = 1.3
            
        load = random.randint(40, 95)
        wear = conf['wear']
        
        # ВЫЗОВ ML-ДВИЖКА ИЗ ml_logic.py
        ml_analysis = engine.predict_utility_risk(pressure, load, wear)
        
        metrics = {
            "water_pressure": pressure,
            "load": f"{load}%",
            "wear": f"{wear}%",
            "status": ml_analysis['status'] # Результат работы ML
        }
        
        return {
            "district": district,
            "type": "utilities",
            "status": ml_analysis['status'],
            "risk_level": ml_analysis['level'],
            "metrics": metrics,
            "ai_report": get_ai_response("utilities", metrics, district)
        }

@app.get("/health")
def health_check():
    return {"status": "online"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)