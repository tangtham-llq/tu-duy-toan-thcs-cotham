
import type { Grade, HintLevel, Mode } from '../types';

export interface ErrorLog {
  id: string;
  timestamp: number;
  message: string;
  stack?: string;
  type: 'api' | 'runtime' | 'unhandled_rejection' | 'action';
  context: {
    grade?: Grade;
    level?: HintLevel;
    mode?: Mode;
    problem?: string;
    studentStep?: string;
    url: string;
    userAgent: string;
  };
  additionalInfo?: any;
}

const LOG_KEY = 'math-app-error-logs';
const MAX_LOGS = 50;

export const errorLoggingService = {
  logError: (
    error: any, 
    type: ErrorLog['type'], 
    context: Partial<ErrorLog['context']> = {},
    additionalInfo?: any
  ): ErrorLog => {
    const logs = errorLoggingService.getLogs();
    
    const newLog: ErrorLog = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type,
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context,
      },
      additionalInfo,
    };

    const updatedLogs = [newLog, ...logs].slice(0, MAX_LOGS);
    localStorage.setItem(LOG_KEY, JSON.stringify(updatedLogs));
    
    console.error(`[ErrorLogged] ${type}:`, newLog);
    return newLog;
  },

  logAction: (action: string, additionalInfo?: any): ErrorLog => {
    const logs = errorLoggingService.getLogs();
    const newLog: ErrorLog = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      message: `Action: ${action}`,
      type: 'action',
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
      additionalInfo,
    };
    const updatedLogs = [newLog, ...logs].slice(0, MAX_LOGS);
    localStorage.setItem(LOG_KEY, JSON.stringify(updatedLogs));
    return newLog;
  },

  getLogs: (): ErrorLog[] => {
    try {
      const stored = localStorage.getItem(LOG_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to read error logs', e);
      return [];
    }
  },

  clearLogs: () => {
    localStorage.removeItem(LOG_KEY);
  },

  exportLogs: (): string => {
    const logs = errorLoggingService.getLogs();
    return JSON.stringify(logs, null, 2);
  }
};
