import React from 'react';
import { AppState, AppSettings } from '../types';
import { Moon, Sun, Save } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, updateSettings }) => {
  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Configurações</h1>
        <p className="text-gray-500 dark:text-gray-400">Personalize sua experiência.</p>
      </header>

      <div className="bg-white dark:bg-dark-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-8">
        
        {/* Appearance */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-700">
           <div>
             <h3 className="font-bold dark:text-white">Aparência</h3>
             <p className="text-sm text-gray-500">Alternar entre tema claro e escuro</p>
           </div>
           <button 
             onClick={() => updateSettings({ darkMode: !settings.darkMode })}
             className={`p-3 rounded-full transition-colors ${settings.darkMode ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'}`}
           >
             {settings.darkMode ? <Sun size={24} /> : <Moon size={24} />}
           </button>
        </div>

        {/* Rates */}
        <div className="space-y-4">
           <h3 className="font-bold dark:text-white">Valores e Moeda</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Moeda</label>
                <select 
                  value={settings.currency}
                  onChange={(e) => updateSettings({ currency: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-gray-50 border-gray-200 text-gray-900 dark:bg-dark-900 dark:border-gray-600 dark:text-white"
                >
                   <option value="BRL">Real (BRL)</option>
                   <option value="USD">Dólar (USD)</option>
                   <option value="EUR">Euro (EUR)</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor/Hora Base</label>
                <input 
                  type="number" 
                  value={settings.hourlyRate}
                  onChange={(e) => updateSettings({ hourlyRate: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded-lg bg-gray-50 border-gray-200 text-gray-900 dark:bg-dark-900 dark:border-gray-600 dark:text-white"
                />
             </div>
           </div>
        </div>

        {/* Multipliers */}
        <div className="space-y-4">
           <h3 className="font-bold dark:text-white">Multiplicadores</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(settings.multipliers).map(([key, val]) => (
                 <div key={key}>
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">{key}</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={val}
                      onChange={(e) => updateSettings({ 
                        multipliers: { ...settings.multipliers, [key]: parseFloat(e.target.value) } 
                      })}
                      className="w-full p-2 border rounded-lg bg-gray-50 border-gray-200 text-gray-900 dark:bg-dark-900 dark:border-gray-600 dark:text-white"
                    />
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};