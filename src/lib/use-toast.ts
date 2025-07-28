import { useState } from 'react';

export interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

// Hook para gerenciar toasts
export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', duration?: number) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return {
    toasts,
    showToast,
    hideToast,
    success: (message: string, duration?: number) => showToast(message, 'success', duration),
    error: (message: string, duration?: number) => showToast(message, 'error', duration),
    info: (message: string, duration?: number) => showToast(message, 'info', duration),
  };
}
