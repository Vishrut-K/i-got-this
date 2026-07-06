"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type ToastType = "success" | "error" | "info" | "confirm";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    confirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProviderCore({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType, onConfirm?: () => void, onCancel?: () => void) => {
    const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString();
    setToasts((prev) => {
      const newToasts = [...prev, { id, message, type, onConfirm, onCancel }];
      // Keep only the 3 most recent toasts
      return newToasts.length > 3 ? newToasts.slice(newToasts.length - 3) : newToasts;
    });
    
    // Auto remove after 4 seconds only if not confirm
    if (type !== "confirm") {
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    }
  }, [removeToast]);

  const toast = {
    success: (message: string) => addToast(message, "success"),
    error: (message: string) => addToast(message, "error"),
    info: (message: string) => addToast(message, "info"),
    confirm: (message: string, onConfirm: () => void, onCancel?: () => void) => addToast(message, "confirm", onConfirm, onCancel),
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context.toast;
}

export function useToastState() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastState must be used within a ToastProvider");
  }
  return { toasts: context.toasts, removeToast: context.removeToast };
}
