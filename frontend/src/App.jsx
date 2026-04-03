import React, { useState, useEffect } from 'react';

const DISTRICTS = ["Medeu", "Bostandyq", "Almaly", "Auezov", "Zhetysu", "Turksib", "Alatau", "Nauryzbay"];
const CATEGORIES = [
  { id: 'ecology', label: 'Экология', icon: '🌱' },
  { id: 'utilities', label: 'ЖКХ', icon: '💧' },
  { id: 'traffic', label: 'Трафик', icon: '🚗' }
];

function App() {
  const [district, setDistrict] = useState("Medeu");
  const [category, setCategory] = useState("ecology");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Функция загрузки данных с твоего FastAPI бэкенда
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://smart-city-almaty-dashboard.onrender.com/api/v1/dashboard...`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [district, category]);

  // Определяем цвет статуса
  const getStatusColor = (status) => {
    if (status === "Critical") return "bg-red-500 text-white";
    if (status === "Warning") return "bg-yellow-500 text-black";
    return "bg-green-500 text-white";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            Smart Almaty AI
          </h1>
          <p className="text-gray-400">Интеллектуальный мониторинг города</p>
        </div>

        <div className="flex gap-4">
          <select 
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* Переключатель категорий */}
        <div className="flex justify-center gap-4 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 ${
                category === cat.id ? 'bg-blue-600 scale-105 shadow-lg shadow-blue-900/20' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-xl animate-pulse">Анализ данных нейросетью...</div>
        ) : data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Карточка статуса */}
            <div className={`p-6 rounded-2xl shadow-xl ${getStatusColor(data.status)}`}>
              <h3 className="text-lg font-medium opacity-80">Текущий статус</h3>
              <p className="text-3xl font-bold mt-2">{data.status}</p>
              {data.risk_level && <p className="mt-1">Риск: {data.risk_level}</p>}
            </div>

            {/* Карточка метрик */}
            <div className="md:col-span-2 bg-gray-800 p-6 rounded-2xl border border-gray-700">
              <h3 className="text-lg font-medium text-gray-400 mb-4">Показатели датчиков</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(data.metrics).map(([key, value]) => (
                  <div key={key} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                    <span className="text-xs uppercase text-gray-500 block">{key}</span>
                    <span className="text-xl font-mono text-blue-400">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ГЛАВНАЯ КАРТОЧКА: Решение Gemini */}
            <div className="md:col-span-3 bg-gradient-to-br from-indigo-900/40 to-gray-800 p-8 rounded-2xl border border-indigo-500/30 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center animate-pulse">
                  ✨
                </div>
                <h3 className="text-xl font-bold text-indigo-300">AI Рекомендация (Gemini)</h3>
              </div>
              <div className="text-lg leading-relaxed text-gray-200 italic">
                "{data.ai_report}"
              </div>
              <div className="mt-4 flex gap-2">
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30">
                  Real-time Analysis
                </span>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">
                  ML Predictive model
                </span>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default App;