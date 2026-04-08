'use client';

import { ToastProvider } from '@/contexts/ToastContext';
import { EnquiryModalProvider } from '@/contexts/EnquiryModalContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <EnquiryModalProvider>{children}</EnquiryModalProvider>
    </ToastProvider>
  );
}
