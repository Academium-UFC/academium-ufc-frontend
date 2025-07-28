import { Toast } from './toast';
import type { ToastData } from '@/lib/use-toast';

interface ToastContainerProps {
  toasts: ToastData[];
  hideToast: (id: string) => void;
}

export function ToastContainer({ toasts, hideToast }: ToastContainerProps) {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          show={true}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </>
  );
}
