import React, { useMemo } from 'react';
import { AppState, WorkType } from '../types';
import { calculateSessionEarnings, exportToCSV, formatCurrency } from '../utils';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Line, ComposedChart, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Download, TrendingUp, Clock, PieChart as PieIcon } from 'lucide-react';

interface ReportsProps {
  state: AppState;
}

const COLORS = {
  primary: '#0ea5e9',   // Sky 500
  secondary: '#8b5cf6', // Violet 500
  tertiary: '#f59e0b',  // Amber 500
  quaternary: '#10b981', // Emerald 500
  darkBg: '#1f2937',    // Gray 800
  grid: '#374151'       // Gray 700
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.tertiary, COLORS.quaternary];

const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 shadow-xl rounded-xl animate-fade-in">
        <p className="font-bold text-gray-700 dark:text-gray-200 mb-2 border-b border-gray-100 dark:border-gray-700 pb-2">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm mb-1 last:mb-0">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-500 dark:text-gray-400 capitalize">
              {entry.name === 'earnings' ? 'Ganhos' : entry.name === 'hours' ? 'Horas' : entry.name}:
            </span>
            <span className="font-medium text-gray-900 dark:text-white ml-auto">
              {entry.name === 'earnings' || (entry.dataKey === 'value' && typeof entry.value === 'number' && entry.value > 24) // Heuristic for money vs hours
                ? formatCurrency(entry.value, currency)
                : entry.name === 'hours' ? `${entry.value.toFixed(1)}h` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const Reports: React.FC<ReportsProps> = ({ state }) => {
  // 1. Aggregate Data by Date for cleaner charts
  const aggregatedData = useMemo(() => {
    const map = new Map<string, { date: string, rawDate: number, earnings: number, hours: number }>();

    state.sessions.forEach(s => {
      if (!s.endTime) return;
      const dateKey = new Date(s.startTime).toLocaleDateString();
      const earning = calculateSessionEarnings(s, state.settings);
      const hours = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / (1000 * 60 * 60);

      if (map.has(dateKey)) {
        const existing = map.get(dateKey)!;
        existing.earnings += earning;
        existing.hours += hours;
      } else {
        map.set(dateKey, { 
          date: dateKey, 
          rawDate: new Date(s.startTime).getTime(), 
          earnings: earning, 
          hours: hours 
        });
      }
    });

    return Array.from(map.values())
      .sort((a, b) => a.rawDate - b.rawDate)
      .slice(-14); // Last 14 days with activity
  }, [state.sessions, state.settings]);

  // 2. Aggregate Data by Work Type
  const typeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    state.sessions.forEach(s => {
      if (!s.endTime) return;
      const hours = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / (1000 * 60 * 60);
      counts[s.type] = (counts[s.type] || 0) + hours;
    });
    
    return Object.entries(counts).map(([key, value]) => ({
      name: key === 'normal' ? 'Normal' : key === 'extra' ? 'Extra' : key === 'night' ? 'Noturno' : 'Feriado',
      value: parseFloat(value.toFixed(1))
    }));
  }, [state.sessions]);

  const handleExport = () => {
    const data = state.sessions.map(s => ({
      Data: new Date(s.startTime).toLocaleDateString(),
      Inicio: new Date(s.startTime).toLocaleTimeString(),
      Fim: s.endTime ? new Date(s.endTime).toLocaleTimeString() : 'N/A',
      Descricao: s.description,
      Tipo: s.type,
      Ganho: calculateSessionEarnings(s, state.settings).toFixed(2)
    }));
    exportToCSV('relatorio_completo.csv', data);
  };

  if (state.sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
           <TrendingUp className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Sem dados suficientes</h2>
        <p className="text-gray-500">Comece a registrar suas sessões de trabalho para visualizar os gráficos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Relatórios & Insights</h1>
           <p className="text-gray-500 dark:text-gray-400">Análise visual do seu desempenho financeiro.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 font-medium"
        >
          <Download size={18} /> Exportar Dados
        </button>
      </header>

      {/* Main Graph: Earnings Trend */}
      <div className="bg-white dark:bg-dark-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
         <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg dark:text-white">Tendência de Ganhos</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Últimos 14 dias de atividade</p>
            </div>
         </div>
         
         <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={aggregatedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} opacity={0.1} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={10}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `k${(value/1000).toFixed(0)}`} 
                  />
                  <Tooltip content={<CustomTooltip currency={state.settings.currency} />} cursor={{ stroke: COLORS.primary, strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area 
                    type="monotone" 
                    dataKey="earnings" 
                    name="earnings"
                    stroke={COLORS.primary} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorEarnings)" 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Productivity Chart */}
        <div className="bg-white dark:bg-dark-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-lg dark:text-white">Produtividade vs. Receita</h3>
           </div>
           
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={aggregatedData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} opacity={0.1} />
                    <XAxis dataKey="date" hide />
                    <YAxis yAxisId="left" orientation="left" stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip currency={state.settings.currency} />} />
                    <Bar yAxisId="left" dataKey="hours" name="hours" barSize={20} fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="earnings" name="earnings" stroke={COLORS.quaternary} strokeWidth={2} dot={false} />
                 </ComposedChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-white dark:bg-dark-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <PieIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-bold text-lg dark:text-white">Distribuição por Tipo</h3>
           </div>

           <div className="h-[300px] w-full flex items-center justify-center">
             {typeDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie
                        data={typeDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {typeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                   </PieChart>
                </ResponsiveContainer>
             ) : (
                <p className="text-gray-400 text-sm">Sem dados de tipos de trabalho.</p>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};