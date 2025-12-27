import React, { useState } from 'react';
import { AppState, TransactionType } from '../types';
import { formatCurrency } from '../utils';
import { TrendingUp, TrendingDown, Trash2, PlusCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip } from 'recharts';

interface FinancesProps {
  state: AppState;
  addTransaction: (t: any) => void;
  deleteTransaction: (id: string) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const Finances: React.FC<FinancesProps> = ({ state, addTransaction, deleteTransaction }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Geral');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({
      type,
      amount: parseFloat(amount),
      description: desc,
      category: category || 'Geral',
      date: new Date(date).toISOString()
    });
    setAmount('');
    setDesc('');
  };

  const chartData = state.transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any[], curr) => {
      const existing = acc.find(item => item.name === curr.category);
      if (existing) {
        existing.value += curr.amount;
      } else {
        acc.push({ name: curr.category, value: curr.amount });
      }
      return acc;
    }, []);

  return (
    <div className="space-y-6">
       <header>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Finanças</h1>
          <p className="text-gray-500 dark:text-gray-400">Controle suas entradas e saídas.</p>
       </header>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
             <h3 className="font-bold text-lg mb-4 dark:text-white">Nova Transação</h3>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                   <button
                     type="button"
                     onClick={() => setType('income')}
                     className={`flex-1 py-2 rounded-md font-medium text-sm transition-all ${type === 'income' ? 'bg-white dark:bg-dark-900 shadow text-green-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                   >
                     Entrada
                   </button>
                   <button
                     type="button"
                     onClick={() => setType('expense')}
                     className={`flex-1 py-2 rounded-md font-medium text-sm transition-all ${type === 'expense' ? 'bg-white dark:bg-dark-900 shadow text-red-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                   >
                     Saída
                   </button>
                </div>
                
                <input 
                  required 
                  type="number" 
                  placeholder="Valor (0.00)" 
                  className="w-full p-3 rounded-xl border bg-gray-50 border-gray-200 text-gray-900 dark:bg-dark-900 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                />
                <input 
                  required 
                  type="text" 
                  placeholder="Descrição" 
                  className="w-full p-3 rounded-xl border bg-gray-50 border-gray-200 text-gray-900 dark:bg-dark-900 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" 
                  value={desc} 
                  onChange={e => setDesc(e.target.value)} 
                />
                <input 
                  required 
                  type="text" 
                  placeholder="Categoria (Ex: Aluguel, Alimentação)" 
                  className="w-full p-3 rounded-xl border bg-gray-50 border-gray-200 text-gray-900 dark:bg-dark-900 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" 
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                />
                <input 
                  required 
                  type="date" 
                  className="w-full p-3 rounded-xl border bg-gray-50 border-gray-200 text-gray-900 dark:bg-dark-900 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                />
                
                <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                   <PlusCircle size={20} /> Adicionar
                </button>
             </form>
          </div>

          {/* List */}
          <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-2 flex flex-col">
            <h3 className="font-bold text-lg mb-4 dark:text-white">Últimos Movimentos</h3>
            <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3 pr-2">
               {state.transactions.map(t => (
                 <div key={t.id} className="flex items-center justify-between p-3 border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors rounded-lg">
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {t.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                       </div>
                       <div>
                          <p className="font-medium dark:text-white">{t.description}</p>
                          <p className="text-xs text-gray-400">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className={`font-bold ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                         {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount, state.settings.currency)}
                       </span>
                       <button onClick={() => deleteTransaction(t.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                 </div>
               ))}
               {state.transactions.length === 0 && <p className="text-center text-gray-400 mt-10">Nenhuma transação registrada.</p>}
            </div>
          </div>
       </div>
        
        {/* Charts Section */}
       {chartData.length > 0 && (
          <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
             <h3 className="font-bold text-lg mb-4 dark:text-white">Despesas por Categoria</h3>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ReTooltip 
                         formatter={(value: number) => formatCurrency(value, state.settings.currency)}
                         contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                      />
                   </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="flex flex-wrap justify-center gap-4 mt-4">
               {chartData.map((entry: any, index: number) => (
                 <div key={index} className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                   <span className="text-sm text-gray-600 dark:text-gray-300">{entry.name}</span>
                 </div>
               ))}
             </div>
          </div>
       )}
    </div>
  );
};