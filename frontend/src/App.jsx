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
      // Ссылка на твой обновленный бэкенд
      const url = `https://smart-city-almaty-dashboard.onrender.com/api/v1/dashboard?category=${category}&district=${district}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Ошибка:", err);
      setError("Ошибка связи с AgroScore Engine");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [district, category]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Smart Almaty AI
          </h1>
          <p className="text-gray-400 font-mono text-sm">Experimental ML Dashboard v2.0</p>
        </div>

        <select 
          className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
        >
          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* Категории */}
        <div className="flex justify-center gap-4 mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-6 py-3 rounded-2xl transition-all flex items-center gap-2 font-bold ${
                category === cat.id ? 'bg-blue-600 shadow-lg shadow-blue-900/40' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 animate-pulse text-blue-400 font-mono">
            [ RUNNING ML_ENGINE INFERENCE... ]
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* СТАТУС */}
            <div className={`p-6 rounded-3xl border-b-4 border-black/20 ${
              data.status === "Critical" ? "bg-red-500" : data.status === "Warning" ? "bg-yellow-500 text-black" : "bg-emerald-500"
            }`}>
              <h3 className="uppercase text-xs font-black opacity-70">Status</h3>
              <p className="text-4xl font-black mt-2">{data.status}</p>
            </div>

            {/* МЕТРИКИ */}
            <div className="md:col-span-2 bg-gray-800 p-6 rounded-3xl border border-gray-700 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.entries(data.metrics).map(([key, value]) => (
                <div key={key} className="bg-gray-900/50 p-3 rounded-xl border border-gray-700/50">
                  <span className="text-[10px] text-gray-500 block uppercase font-bold">{key}</span>
                  <span className="text-xl font-mono text-blue-300 font-bold">{value}</span>
                </div>
              ))}
            </div>

            {/* !!! НОВЫЙ БЛОК: ML ПРОГНОЗ ВРЕМЕНИ !!! */}
            {data.ml_forecast && (
              <div className="md:col-span-1 bg-gradient-to-br from-blue-900/40 to-gray-800 p-6 rounded-3xl border border-blue-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-blue-400 font-black text-xs uppercase tracking-tighter">ML Forecast</h3>
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md font-mono">{data.ml_forecast.probability}</span>
                  </div>
                  <p className="text-4xl font-mono font-black mt-4 text-white">
                    {data.ml_forecast.value}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">{data.ml_forecast.label}</p>
                </div>
                <div className="mt-6">
                  <p className="text-[10px] text-blue-400/60 uppercase font-bold mb-2">Trend Analysis</p>
                  <p className="text-sm italic text-gray-300">"{data.ml_forecast.trend}"</p>
                </div>
              </div>
            )}

            {/* GEMINI REPORT */}
            <div className={`${data.ml_forecast ? 'md:col-span-2' : 'md:col-span-3'} bg-gray-800 p-8 rounded-3xl border border-indigo-500/20 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <h3 className="text-indigo-400 font-black text-xs uppercase mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
                Gemini AI Insight
              </h3>
              <p className="text-lg leading-relaxed text-gray-200">
                {data.ai_report}
              </p>
            </div>

          </div>
        ) : null}
      </main>

      <footer className="max-w-6xl mx-auto mt-20 text-center text-gray-600 text-[10px] uppercase tracking-widest">
        Powered by Scikit-learn & AgroScore.AI Engine
      </footer>
    </div>
  );
}

export default App;