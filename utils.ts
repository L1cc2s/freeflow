import { WorkSession, AppSettings, Transaction } from './types';

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const formatCurrency = (amount: number, currency: string = 'BRL') => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDuration = (ms: number) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)));

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const calculateSessionEarnings = (session: WorkSession, settings: AppSettings): number => {
  if (!session.endTime) return 0;
  
  const start = new Date(session.startTime).getTime();
  const end = new Date(session.endTime).getTime();
  const durationMs = end - start;
  const breakMs = session.breakDurationMinutes * 60 * 1000;
  const netDurationHours = Math.max(0, (durationMs - breakMs) / (1000 * 60 * 60));

  const multiplier = settings.multipliers[session.type] || 1;
  // Use snapshot rate if available, otherwise current rate (fallback logic)
  const rate = session.hourlyRateSnapshot || settings.hourlyRate;
  
  return netDurationHours * rate * multiplier;
};

export const exportToCSV = (filename: string, rows: object[]) => {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows.map(row => {
      return keys.map(k => {
        let cell = (row as any)[k] === null || (row as any)[k] === undefined ? '' : (row as any)[k];
        cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
        if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
        return cell;
      }).join(separator);
    }).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};