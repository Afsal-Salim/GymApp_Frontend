import { createContext, useCallback, useContext, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import './ToastContext.css';

type ToastVariant = 'danger' | 'success' | 'warning' | 'info';

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

const AUTO_HIDE_MS = 5000;

const VARIANT_LABELS: Record<ToastVariant, string> = {
  danger: 'Error',
  success: 'Success',
  warning: 'Notice',
  info: 'Info',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);

  const showToast = useCallback((message: string, variant: ToastVariant = 'danger') => {
    setToast({ message, variant });
  }, []);

  const onClose = useCallback(() => setToast(null), []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer position="bottom-end" className="app-toast-container p-3" style={{ zIndex: 9999 }}>
        <Toast
          show={!!toast}
          onClose={onClose}
          autohide
          delay={AUTO_HIDE_MS}
          className={`app-toast app-toast--${toast?.variant ?? 'info'}`}
        >
          <Toast.Header closeButton className="app-toast__header">
            <span className="app-toast__icon" aria-hidden />
            <strong className="me-auto">{toast ? VARIANT_LABELS[toast.variant] : 'Notice'}</strong>
          </Toast.Header>
          <Toast.Body className="app-toast__body">
            {toast?.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </ToastContext.Provider>
  );
}
