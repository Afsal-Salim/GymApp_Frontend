'use client';

import { ToastProvider } from '@/contexts/ToastContext/ToastContext';
import { EnquiryModalProvider } from '@/contexts/EnquiryModalContext/EnquiryModalContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <EnquiryModalProvider>{children}</EnquiryModalProvider>
    </ToastProvider>
  );
}
