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
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // ТВОЯ ЖИВАЯ ССЫЛКА НА RENDER
      const url = `https://smart-city-almaty-dashboard.onrender.com/api/v1/dashboard?category=${category}&district=${district}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Ошибка загрузки:", err);
      setError("Не удалось загрузить данные. Проверьте статус бэкенда на Render.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [district, category]);

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
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-white"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            {DISTRICTS.map(d => <option key={d} value={d} className="bg-gray-800">{d}</option>)}
          </select>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* Переключатель категорий */}
        <div className="flex justify-center flex-wrap gap-4 mb-8">
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
          <div className="text-center py-20 text-xl animate-pulse text-blue-400">
            🧠 Нейросеть анализирует данные Алматы...
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-400 bg-red-900/10 rounded-2xl border border-red-900/30">
            {error}
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* Карточка статуса */}
            <div className={`p-6 rounded-2xl shadow-xl transition-all duration-500 ${getStatusColor(data.status)}`}>
              <h3 className="text-lg font-medium opacity-80">Текущий статус</h3>
              <p className="text-3xl font-bold mt-2">{data.status || "N/A"}</p>
              {data.risk_level && <p className="mt-1 opacity-90 italic">Риск: {data.risk_level}</p>}
            </div>

            {/* Карточка метрик */}
            <div className="md:col-span-2 bg-gray-800 p-6 rounded-2xl border border-gray-700">
              <h3 className="text-lg font-medium text-gray-400 mb-4">Показатели датчиков</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {data.metrics && Object.entries(data.metrics).map(([key, value]) => (
                  <div key={key} className="bg-gray-900 p-4 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-colors">
                    <span className="text-[10px] uppercase text-gray-500 block mb-1">{key.replace('_', ' ')}</span>
                    <span className="text-xl font-mono text-blue-400 font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ГЛАВНАЯ КАРТОЧКА: Решение Gemini */}
            <div className="md:col-span-3 bg-gradient-to-br from-indigo-900/40 to-gray-800 p-8 rounded-2xl border border-indigo-500/30 shadow-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20 animate-bounce">
                  ✨
                </div>
                <div>
                  <h3 className="text-xl font-bold text-indigo-300">AI Рекомендация (Gemini)</h3>
                  <p className="text-xs text-indigo-400 opacity-70">Обработка в реальном времени</p>
                </div>
              </div>
              <div className="text-lg leading-relaxed text-gray-200 italic border-l-4 border-indigo-500 pl-6 py-2">
                "{data.ai_report || "Анализ еще не завершен..."}"
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30 uppercase tracking-widest">
                  Real-time Data
                </span>
                <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30 uppercase tracking-widest">
                  Machine Learning
                </span>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">Выберите категорию для анализа.</div>
        )}
      </main>
      
      <footer className="max-w-6xl mx-auto mt-20 pb-8 text-center text-gray-600 text-sm">
        <p>© 2026 Smart City Almaty Dashboard | AgroScore.AI Engine</p>
      </footer>
    </div>
  );
}

export default App;