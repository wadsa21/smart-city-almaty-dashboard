import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wind, Droplets, Activity, AlertCircle, MapPin, Shield, Zap, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const districts = ["Medeu", "Almaly", "Bostandyq", "Auezov", "Zhetysu", "Turksib", "Alatau", "Nauryzbay"];

export default function App() {
  const [activeTab, setActiveTab] = useState('ecology');
  const [selectedDistrict, setSelectedDistrict] = useState('Medeu');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:8000/api/v1/data?type=${activeTab}&district=${selectedDistrict}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [activeTab, selectedDistrict]);

  // Мок-данные для графика, так как он еще не интегрирован в бэкенд
  const chartData = [
    { t: '10:00', v: 40 }, { t: '12:00', v: 45 }, { t: '14:00', v: 42 },
    { t: '16:00', v: 50 }, { t: '18:00', v: 48 }, { t: '20:00', v: activeTab === 'ecology' ? 55 : 3.5 }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-sans selection:bg-blue-500/30">
      {/* SIDEBAR */}
      <aside className="w-80 bg-[#0a0a0a] border-r border-white/5 flex flex-col sticky top-0 h-screen">
        <div className="p-8 flex items-center gap-3 border-b border-white/5">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/20">
            <Activity size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic">Almaty AI</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 mt-4">
          <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Городские Районы</p>
          {districts.map(d => (
            <button key={d} onClick={() => setSelectedDistrict(d)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                selectedDistrict === d ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 ring-1 ring-blue-500/10' : 'text-gray-500 hover:bg-white/5'
              }`}>
              <div className="flex items-center gap-3">
                <MapPin size={16} className={selectedDistrict === d ? 'text-blue-400' : 'text-gray-600'} />
                <span className="font-semibold text-sm">{d}</span>
              </div>
              {selectedDistrict === d && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 mt-auto bg-[#080808]">
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-gray-600" size={18} />
            <input type="text" placeholder="Быстрый поиск..." className="w-full bg-[#1a1a1e] text-sm text-gray-400 p-3 pl-12 rounded-xl border border-white/5 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition" />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-1">{selectedDistrict} District</h2>
            <p className="text-gray-400 text-sm flex items-center gap-2">
               <Zap size={14} className="text-yellow-500" /> Live AI-Analysis Active
            </p>
          </div>

          <div className="flex bg-[#0a0a0a] p-1 rounded-2xl border border-white/10 shadow-2xl">
            <button onClick={() => setActiveTab('ecology')}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ecology' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'
              }`}><Wind size={16} /> ECOLOGY</button>
            <button onClick={() => setActiveTab('utilities')}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'utilities' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'
              }`}><Droplets size={16} /> UTILITIES</button>
          </div>
        </header>

        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4 text-blue-500">
             <Activity className="animate-spin" size={40} />
             <span className="font-mono text-xs uppercase tracking-widest">Fetching District Data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-8">
            {/* STAT CARD WITH INTEGRATED CHART */}
            <div className="col-span-12 lg:col-span-8 bg-[#0a0a0a]/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden group shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 right-0 p-8">
                <Shield size={40} className="text-blue-500/10 group-hover:text-blue-500/20 transition-colors" />
              </div>
              
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Current Metric</p>
              <div className="flex items-baseline gap-4 mb-10">
                <span className="text-9xl font-black tracking-tighter bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
                  {activeTab === 'ecology' ? data.metrics.aqi : data.metrics.water_pressure}
                </span>
                <span className="text-2xl font-bold text-gray-600 uppercase tracking-widest">
                  {activeTab === 'ecology' ? 'AQI' : 'BAR'}
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="t" stroke="#333" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px'}}
                      itemStyle={{color: '#3b82f6'}}
                      cursor={{stroke: '#3b82f6', strokeWidth: 1}}
                    />
                    <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={4} dot={{fill: '#3b82f6', r: 4}} activeDot={{r: 8}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI REPORT WITH VISUAL PROGRESS BAR */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
              <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 h-full flex flex-col justify-between shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] ${
                data.status === 'Stable' 
                  ? 'bg-green-500/5 border-green-500/10' 
                  : 'bg-red-500/5 border-red-500/10 shadow-[0_0_50px_-12px_rgba(239,68,68,0.3)]'
              }`}>
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <div className={`p-2 rounded-lg ${data.status === 'Stable' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      <AlertCircle size={20} className={data.status === 'Stable' ? 'text-green-400' : 'text-red-400'} />
                    </div>
                    <span className="font-black text-sm uppercase tracking-widest">AI Status Report</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold leading-tight mb-4">{data.ai_report.issue}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm italic">{data.ai_report.action}</p>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <span>Reliability Score</span>
                    <span className="text-blue-500">98.4%</span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-600 h-full w-[98.4%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}