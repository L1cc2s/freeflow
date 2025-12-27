import { useState, useEffect, useCallback } from 'react';
import { AppState, AppSettings, WorkSession, Transaction, WorkType } from './types';
import { generateId } from './utils';

const STORAGE_KEY = 'freeflow_data_v1';

const DEFAULT_SETTINGS: AppSettings = {
  currency: 'BRL',
  hourlyRate: 50,
  multipliers: {
    normal: 1,
    extra: 1.5,
    night: 1.2,
    holiday: 2,
  },
  darkMode: false,
};

const DEFAULT_STATE: AppState = {
  sessions: [],
  transactions: [],
  settings: DEFAULT_SETTINGS,
  activeSessionId: null,
};

export const useAppStore = () => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_STATE;
    } catch (e) {
      console.error("Failed to load state", e);
      return DEFAULT_STATE;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (state.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setState(prev => ({ ...prev, settings: { ...prev.settings, ...newSettings } }));
  }, []);

  const startSession = useCallback((description: string, type: WorkType) => {
    const newSession: WorkSession = {
      id: generateId(),
      startTime: new Date().toISOString(),
      breakDurationMinutes: 0,
      type,
      hourlyRateSnapshot: state.settings.hourlyRate,
      description,
    };
    setState(prev => ({
      ...prev,
      sessions: [newSession, ...prev.sessions],
      activeSessionId: newSession.id
    }));
  }, [state.settings.hourlyRate]);

  const stopSession = useCallback(() => {
    setState(prev => {
      if (!prev.activeSessionId) return prev;
      const updatedSessions = prev.sessions.map(s => 
        s.id === prev.activeSessionId ? { ...s, endTime: new Date().toISOString() } : s
      );
      return { ...prev, sessions: updatedSessions, activeSessionId: null };
    });
  }, []);

  const addManualSession = useCallback((session: Omit<WorkSession, 'id' | 'hourlyRateSnapshot'>) => {
    const newSession: WorkSession = {
        ...session,
        id: generateId(),
        hourlyRateSnapshot: state.settings.hourlyRate,
    };
    setState(prev => ({ ...prev, sessions: [newSession, ...prev.sessions] }));
  }, [state.settings.hourlyRate]);

  const deleteSession = useCallback((id: string) => {
    setState(prev => ({ ...prev, sessions: prev.sessions.filter(s => s.id !== id) }));
  }, []);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...transaction, id: generateId() };
    setState(prev => ({ ...prev, transactions: [newTx, ...prev.transactions] }));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setState(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
  }, []);

  return {
    state,
    updateSettings,
    startSession,
    stopSession,
    addManualSession,
    deleteSession,
    addTransaction,
    deleteTransaction
  };
};