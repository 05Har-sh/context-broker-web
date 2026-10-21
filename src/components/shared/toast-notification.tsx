"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onDismiss: () => void;
}

export function Toast({ message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const Icon = type === "success" ? CheckCircle : type === "info" ? Info : AlertCircle;
  const bgClass =
    type === "success"
      ? "bg-green-600 text-white"
      : type === "info"
      ? "bg-blue-600 text-white"
      : "bg-error text-on-error";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`fixed bottom-6 right-6 z-[200] ${bgClass} px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

/** Wrapper component for AnimatePresence */
export function ToastContainer({ toast, onDismiss }: {
  toast: { message: string; type: "success" | "error" | "info" } | null;
  onDismiss: () => void;
}) {
  return (
    <AnimatePresence>
      {toast && (
        <Toast
          key={toast.message}
          message={toast.message}
          type={toast.type}
          onDismiss={onDismiss}
        />
      )}
    </AnimatePresence>
  );
}
