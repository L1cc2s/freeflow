import React, { useState, useEffect } from 'react';
import { AppState, WorkType } from '../types';
import { formatDuration } from '../utils';
import { Play, Square, Plus, Trash2, Clock } from 'lucide-react';

interface TimeTrackerProps {
  state: AppState;
  startSession: (desc: string, type: WorkType) => void;
  stopSession: () => void;
  deleteSession: (id: string) => void;
  addManualSession: (s: any) => void;
}

export const TimeTracker: React.FC<TimeTrackerProps> = ({ state, startSession, stopSession, deleteSession, addManualSession }) => {
  const [elapsed, setElapsed] = useState(0);
  const [description, setDescription] = useState('');
  const [workType, setWorkType] = useState<WorkType>('normal');
  const [showManual, setShowManual] = useState(false);

  // Manual Form State
  const [manualDate, setManualDate] = useState('');
  const [manualStart, setManualStart] = useState('');
  const [manualEnd, setManualEnd] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [manualType, setManualType] = useState<WorkType>('normal');

  const activeSession = state.sessions.find(s => s.id === state.activeSessionId);

  useEffect(() => {
    let interval: any;
    if (activeSession) {
      const startTime = new Date(activeSession.startTime).getTime();
      interval = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 1000);
      setElapsed(Date.now() - startTime); // Initial sync
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const handleStart = () => {
    if (!description.trim()) {
      alert('Por favor, adicione uma descrição para o trabalho.');
      return;
    }
    startSession(description, workType);
    setDescription('');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(`${manualDate}T${manualStart}:00`).toISOString();
    const end = new Date(`${manualDate}T${manualEnd}:00`).toISOString();
    
    addManualSession({
        startTime: start,
        endTime: end,
        breakDurationMinutes: 0,
        type: manualType,
        description: manualDesc,
    });
    setShowManual(false);
    setManualDesc('');
    setManualStart('');
    setManualEnd('');
    setManualDate('');
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Registro de Horas</h1>
          <p className="text-gray-500 dark:text-gray-400">Gerencie seu tempo e maximize seus ganhos.</p>
        </div>
        <button 
          onClick={() => setShowManual(!showManual)}
          className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline"
        >
          <Plus size={18} /> {showManual ? 'Fechar Manual' : 'Lançamento Manual'}
        </button>
      </header>

      {/* Active Timer Card */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center space-y-6">
        <div className="text-6xl font-mono font-bold text-gray-900 dark:text-white tracking-wider">
          {formatDuration(elapsed)}
        </div>
        
        {!activeSession ? (
          <div className="w-full max-w-md space-y-4">
            <input
              type="text"
              placeholder="No que você está trabalhando?"
              className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white text-gray-900"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex gap-4">
              <select 
                value={workType}
                onChange={(e) => setWorkType(e.target.value as WorkType)}
                className="p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white text-gray-900"
              >
                <option value="normal">Normal</option>
                <option value="extra">Hora Extra</option>
                <option value="night">Adicional Noturno</option>
                <option value="holiday">Feriado</option>
              </select>
              <button 
                onClick={handleStart}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Play size={20} fill="currentColor" /> Iniciar
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md text-center space-y-4">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Trabalhando em: <span className="font-semibold text-primary-600 dark:text-primary-400">{activeSession.description}</span>
            </p>
            <button 
              onClick={stopSession}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Square size={20} fill="currentColor" /> Parar Trabalho
            </button>
          </div>
        )}
      </div>

      {/* Manual Entry Form */}
      {showManual && (
        <form onSubmit={handleManualSubmit} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 animate-fade-in">
           <h3 className="font-bold mb-4 dark:text-white">Registro Manual</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input required type="date" className="p-2 rounded border bg-white border-gray-200 text-gray-900 dark:bg-dark-900 dark:border-gray-700 dark:text-white" value={manualDate} onChange={e => setManualDate(e.target.value)} />
              <input required type="text" placeholder="Descrição" className="p-2 rounded border bg-white border-gray-200 text-gray-900 dark:bg-dark-900 dark:border-gray-700 dark:text-white" value={manualDesc} onChange={e => setManualDesc(e.target.value)} />
              <div className="flex gap-2">
                 <input required type="time" className="flex-1 p-2 rounded border bg-white border-gray-200 text-gray-900 dark:bg-dark-900 dark:border-gray-700 dark:text-white" value={manualStart} onChange={e => setManualStart(e.target.value)} />
                 <span className="self-center dark:text-white">às</span>
                 <input required type="time" className="flex-1 p-2 rounded border bg-white border-gray-200 text-gray-900 dark:bg-dark-900 dark:border-gray-700 dark:text-white" value={manualEnd} onChange={e => setManualEnd(e.target.value)} />
              </div>
              <select className="p-2 rounded border bg-white border-gray-200 text-gray-900 dark:bg-dark-900 dark:border-gray-700 dark:text-white" value={manualType} onChange={e => setManualType(e.target.value as WorkType)}>
                <option value="normal">Normal</option>
                <option value="extra">Extra</option>
                <option value="night">Noturno</option>
                <option value="holiday">Feriado</option>
              </select>
           </div>
           <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">Salvar Registro</button>
        </form>
      )}

      {/* History List */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Clock className="text-gray-400" /> Histórico Recente
          </h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {state.sessions.filter(s => s.endTime).map(session => (
            <div key={session.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{session.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(session.startTime).toLocaleDateString()} • {new Date(session.startTime).toLocaleTimeString().slice(0,5)} - {new Date(session.endTime!).toLocaleTimeString().slice(0,5)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 text-xs rounded-full uppercase font-bold ${
                  session.type === 'normal' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 
                  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                }`}>
                  {session.type}
                </span>
                <button onClick={() => deleteSession(session.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {state.sessions.filter(s => s.endTime).length === 0 && (
            <div className="p-8 text-center text-gray-500">Nenhum registro encontrado. Comece a trabalhar!</div>
          )}
        </div>
      </div>
    </div>
  );
};