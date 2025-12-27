import React, { useMemo } from 'react';
import { AppState } from '../types';
import { calculateSessionEarnings, formatCurrency } from '../utils';
import { DollarSign, Clock, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface DashboardProps {
  state: AppState;
}

export const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlySessions = state.sessions.filter(s => {
      const d = new Date(s.startTime);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && s.endTime;
    });

    const monthlyEarnings = monthlySessions.reduce((acc, s) => acc + calculateSessionEarnings(s, state.settings), 0);
    const totalHours = monthlySessions.reduce((acc, s) => {
      const start = new Date(s.startTime).getTime();
      const end = new Date(s.endTime!).getTime();
      return acc + (end - start) / (1000 * 60 * 60);
    }, 0);

    const monthlyTransactions = state.transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const income = monthlyTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

    return { monthlyEarnings, totalHours, income, expense, balance: (monthlyEarnings + income) - expense };
  }, [state.sessions, state.transactions, state.settings]);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Visão Geral</h1>
        <p className="text-gray-500 dark:text-gray-400">Resumo financeiro e de produtividade deste mês.</p>
      </header>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Estimado (Mês)</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(stats.balance, state.settings.currency)}</h3>
        </div>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-full">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Horas Trabalhadas</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalHours.toFixed(1)}h</h3>
        </div>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Receitas Totais</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(stats.monthlyEarnings + stats.income, state.settings.currency)}</h3>
        </div>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Despesas</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(stats.expense, state.settings.currency)}</h3>
        </div>
      </div>

      {/* AI / Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-lg dark:text-white">Atividade Recente</h3>
          </div>
          <div className="space-y-4">
             {state.sessions.slice(0, 3).map(s => (
               <div key={s.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                 <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-gray-200">{s.description || 'Trabalho sem descrição'}</span>
                    <span className="text-xs text-gray-500">{new Date(s.startTime).toLocaleDateString()} • {s.endTime ? `${(calculateSessionEarnings(s, state.settings)).toFixed(2)} ganhos` : 'Em andamento'}</span>
                 </div>
                 <span className={`px-2 py-1 text-xs rounded-full ${s.type === 'normal' ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                   {s.type.toUpperCase()}
                 </span>
               </div>
             ))}
             {state.sessions.length === 0 && <p className="text-gray-400 text-center py-4">Nenhuma atividade recente.</p>}
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white">
          <h3 className="font-bold text-lg mb-2">Dica Financeira</h3>
          <p className="opacity-90 leading-relaxed">
            Mantenha suas despesas abaixo de 70% da sua renda mensal para garantir uma reserva de emergência saudável. 
            Baseado nos seus dados atuais, você está {stats.expense > (stats.monthlyEarnings + stats.income) * 0.7 ? 'acima' : 'abaixo'} desse limite.
          </p>
          <button className="mt-6 bg-white text-indigo-700 px-4 py-2 rounded-lg font-medium text-sm hover:bg-indigo-50 transition-colors">
            Ver Relatório Completo
          </button>
        </div>
      </div>
    </div>
  );
};