"use client";

import { ToastProviderCore, useToastState } from "@/contexts/ToastContext";
import { ReactNode } from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

function ToastContainer() {
  const { toasts, removeToast } = useToastState();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] flex flex-col gap-4 pointer-events-none w-[90%] max-w-[380px]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto relative animate-fade-down w-full"
        >
          {/* The torn paper background */}
          <div 
            className="absolute inset-0 bg-white dark:bg-[#2A2927]"
            style={{ 
              filter: "url(#torn-paper)",
            }}
          />
          {/* The content */}
          <div className="relative z-10 px-5 py-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              {toast.type === "error" && <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
              {toast.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
              {toast.type === "info" && <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />}
              {toast.type === "confirm" && <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
              
              <p className="flex-1 text-stone-800 dark:text-stone-200 text-[14px] leading-relaxed font-medium pt-[2px]">
                {toast.message}
              </p>
              
              {toast.type !== "confirm" && (
                <button 
                  onClick={() => {
                    toast.onCancel?.();
                    removeToast(toast.id);
                  }}
                  className="shrink-0 text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
                >
                  <X className="w-4 h-4 mt-0.5" />
                </button>
              )}
            </div>
            
            {toast.type === "confirm" && (
              <div className="flex items-center gap-3 pl-8 mt-1">
                <button
                  onClick={() => {
                    toast.onConfirm?.();
                    removeToast(toast.id);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white text-[12px] font-semibold tracking-wide px-4 py-1.5 rounded shadow-sm transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => {
                    toast.onCancel?.();
                    removeToast(toast.id);
                  }}
                  className="text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 text-[12px] font-semibold tracking-wide transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <ToastProviderCore>
      {/* Global SVG Filter for the torn paper effect */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <filter id="torn-paper" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
          {/* We add the shadow AFTER displacement so the shadow matches the torn edges */}
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.12" />
        </filter>
      </svg>
      
      {children}
      <ToastContainer />
    </ToastProviderCore>
  );
}
