export type WorkType = 'normal' | 'extra' | 'night' | 'holiday';

export interface WorkSession {
  id: string;
  startTime: string; // ISO String
  endTime?: string; // ISO String
  breakDurationMinutes: number;
  type: WorkType;
  hourlyRateSnapshot: number;
  description: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // ISO String
  description: string;
}

export interface AppSettings {
  currency: string;
  hourlyRate: number;
  multipliers: {
    normal: number;
    extra: number;
    night: number;
    holiday: number;
  };
  darkMode: boolean;
}

export interface AppState {
  sessions: WorkSession[];
  transactions: Transaction[];
  settings: AppSettings;
  activeSessionId: string | null;
}