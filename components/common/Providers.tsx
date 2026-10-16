'use client';

import React from 'react';
import { AppProvider, useAppContext } from '@/lib/context';
import { ToastContainer } from '@/components/ui/Toast';

function ToastWrapper() {
  const { toasts, removeToast } = useAppContext();
  return <ToastContainer toasts={toasts} onDismiss={removeToast} />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      {children}
      <ToastWrapper />
    </AppProvider>
  );
}
