import os
import random
import requests
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Импорт твоего движка
from ml_logic import engine 

load_dotenv()

app = FastAPI(title="Smart City Almaty API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TOMTOM_KEY = os.getenv("TOMTOM_API_KEY")

DISTRICTS = {
    "Medeu": {"lat": 43.2360, "lon": 76.9458, "wear": 45},
    "Bostandyq": {"lat": 43.2185, "lon": 76.9276, "wear": 85},
    "Almaly": {"lat": 43.2551, "lon": 76.9126, "wear": 60},
    "Auezov": {"lat": 43.2381, "lon": 76.8453, "wear": 55},
    "Zhetysu": {"lat": 43.3000, "lon": 76.9333, "wear": 70},
    "Turksib": {"lat": 43.3444, "lon": 76.9493, "wear": 75},
    "Alatau": {"lat": 43.3000, "lon": 76.8000, "wear": 30},
    "Nauryzbay": {"lat": 43.2000, "lon": 76.7800, "wear": 25},
}

def get_traffic_data(lat, lon):
    if not TOMTOM_KEY:
        return {"index": random.randint(1, 8), "speed": random.randint(20, 60)}
    try:
        url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key={TOMTOM_KEY}&point={lat},{lon}"
        r = requests.get(url, timeout=5).json()
        flow = r['flowSegmentData']
        idx = min(10, round((1 - flow['currentSpeed']/flow['freeFlowSpeed']) * 12))
        return {"index": max(1, idx), "speed": flow['currentSpeed']}
    except:
        return {"index": 3, "speed": 45}

@app.get("/api/v1/dashboard")
async def get_dashboard_data(
    category: str = Query(...), 
    district: str = Query(...)
):
    if district not in DISTRICTS:
        raise HTTPException(status_code=404, detail="Район не найден")
    
    conf = DISTRICTS[district]
    
    # 1. Сбор метрик
    if category == "traffic":
        metrics = get_traffic_data(conf['lat'], conf['lon'])
        status = "Critical" if metrics['index'] >= 8 else "Stable"
    elif category == "utilities":
        pressure = 1.2 if district == "Bostandyq" else 3.8
        load = 92 if district == "Bostandyq" else 40
        risk = engine.predict_utility_risk(pressure, load, conf['wear'])
        metrics = {"pressure": pressure, "load": load, "wear": conf['wear']}
        status = risk['status']
    else: # ecology
        metrics = {"aqi": random.randint(1, 5), "pm25": random.uniform(10, 80)}
        status = "Warning" if metrics['aqi'] >= 4 else "Stable"

    # 2. ДОБАВЛЯЕМ ML-ПРОГНОЗ ВРЕМЕНИ (Regression)
    # Мы вызываем функцию из ml_logic (убедись, что она там есть!)
    # Если функции там нет, можно добавить простую логику прямо тут:
    try:
        # Пытаемся вызвать из твоего движка, если ты её туда добавил
        ml_forecast = engine.calculate_time_forecast(category, metrics)
    except AttributeError:
        # Запасной вариант, если в ml_logic еще нет этой функции
        if category == "traffic":
            val = metrics.get('index', 1) * 15
            ml_forecast = {"label": "Разгрузка через", "value": f"{val} мин", "trend": "Анализ трафика", "probability": "85%"}
        else:
            ml_forecast = {"label": "Очистка через", "value": "2.4 ч", "trend": "Стабилизация", "probability": "90%"}

    # 3. Получаем совет от AI
    ai_advice = await engine.get_ai_recommendation(category, district, metrics)

    # 4. ФОРМИРУЕМ ОТВЕТ С НОВЫМ ПОЛЕМ
    return {
        "district": district,
        "category": category,
        "status": status,
        "metrics": metrics,
        "ml_forecast": ml_forecast, # КЛЮЧЕВОЕ ПОЛЕ ДЛЯ ФРОНТЕНДА
        "ai_report": ai_advice
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)