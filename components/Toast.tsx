import React, { useEffect, useState } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { cn } from "./UI";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastProps {
  id: string;
  title: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  message,
  type = "info",
  duration = 4000,
  onClose,
}) => {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - 100 / (duration / 50);
          return newProgress < 0 ? 0 : newProgress;
        });
      }, 50);

      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => onClose(id), 300);
      }, duration);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [id, duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  };

  const configs = {
    success: {
      icon: <CheckCircle2 className="w-6 h-6" />,
      bgGradient: "from-emerald-500 to-green-600",
      iconBg: "bg-white/20",
      textColor: "text-white",
      progressColor: "bg-white/40",
      shadowColor: "shadow-emerald-500/30",
    },
    error: {
      icon: <AlertCircle className="w-6 h-6" />,
      bgGradient: "from-red-500 to-rose-600",
      iconBg: "bg-white/20",
      textColor: "text-white",
      progressColor: "bg-white/40",
      shadowColor: "shadow-red-500/30",
    },
    info: {
      icon: <Info className="w-6 h-6" />,
      bgGradient: "from-blue-500 to-cyan-600",
      iconBg: "bg-white/20",
      textColor: "text-white",
      progressColor: "bg-white/40",
      shadowColor: "shadow-blue-500/30",
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6" />,
      bgGradient: "from-amber-500 to-orange-600",
      iconBg: "bg-white/20",
      textColor: "text-white",
      progressColor: "bg-white/40",
      shadowColor: "shadow-amber-500/30",
    },
  };

  const config = configs[type];

  return (
    <div
      className={cn(
        "relative bg-gradient-to-r backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden w-96 transition-all duration-300 border border-white/10",
        config.bgGradient,
        config.shadowColor,
        isExiting
          ? "opacity-0 translate-x-full scale-90"
          : "opacity-100 translate-x-0 scale-100 animate-in slide-in-from-right-8 fade-in duration-400"
      )}
    >
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-black/10 w-full">
        <div
          className={cn(
            "h-full transition-all duration-100 ease-linear rounded-r-full",
            config.progressColor
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-5 flex gap-4 items-start">
        {/* Icon with animated background */}
        <div className={cn("flex-shrink-0 relative", config.textColor)}>
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              config.iconBg
            )}
          >
            <div className="absolute inset-0 animate-ping opacity-20 rounded-xl">
              {config.icon}
            </div>
            <div className="relative">{config.icon}</div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-1">
          <h4
            className={cn(
              "text-base font-bold mb-1.5 leading-tight",
              config.textColor
            )}
          >
            {title}
          </h4>
          <p
            className={cn(
              "text-sm leading-relaxed opacity-95",
              config.textColor
            )}
          >
            {message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className={cn(
            "flex-shrink-0 rounded-lg p-1.5 transition-all duration-200 hover:bg-white/20 active:scale-90 mt-1",
            config.textColor
          )}
          aria-label="Close notification"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts = [],
  onClose,
}) => {
  return (
    <div className="fixed top-6 right-6 z-[9999] space-y-4 pointer-events-none max-w-[420px]">
      <div className="pointer-events-auto space-y-4">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </div>
    </div>
  );
};

// Toast context + provider for global use across the app
type ToastContextValue = {
  showToast: (
    title: string,
    message: string,
    type?: ToastType,
    duration?: number
  ) => void;
  removeToast: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | undefined>(
  undefined
);

export const ToastProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showToast = (
    title: string,
    message: string,
    type: ToastType = "info",
    duration: number = 4000
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastProps = {
      id,
      title,
      message,
      type,
      duration,
      onClose: removeToast,
    };

    // Limit to 4 toasts at a time
    setToasts((prev) => {
      const updated = [...prev, newToast];
      return updated.slice(-4);
    });
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
};
