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
      icon: <CheckCircle2 className="w-5 h-5" />,
      bgGradient: "from-green-50 to-emerald-50",
      borderColor: "border-green-400",
      iconColor: "text-green-600",
      titleColor: "text-green-900",
      messageColor: "text-green-700",
      progressColor: "bg-green-500",
      glowColor: "shadow-green-500/20",
    },
    error: {
      icon: <AlertCircle className="w-5 h-5" />,
      bgGradient: "from-red-50 to-rose-50",
      borderColor: "border-red-400",
      iconColor: "text-red-600",
      titleColor: "text-red-900",
      messageColor: "text-red-700",
      progressColor: "bg-red-500",
      glowColor: "shadow-red-500/20",
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      bgGradient: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-400",
      iconColor: "text-blue-600",
      titleColor: "text-blue-900",
      messageColor: "text-blue-700",
      progressColor: "bg-blue-500",
      glowColor: "shadow-blue-500/20",
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5" />,
      bgGradient: "from-amber-50 to-yellow-50",
      borderColor: "border-amber-400",
      iconColor: "text-amber-600",
      titleColor: "text-amber-900",
      messageColor: "text-amber-700",
      progressColor: "bg-amber-500",
      glowColor: "shadow-amber-500/20",
    },
  };

  const config = configs[type];

  return (
    <div
      className={cn(
        "relative bg-gradient-to-br backdrop-blur-sm border-l-4 rounded-lg shadow-xl overflow-hidden w-80 transition-all duration-300",
        config.bgGradient,
        config.borderColor,
        config.glowColor,
        isExiting
          ? "opacity-0 translate-x-full scale-95"
          : "opacity-100 translate-x-0 scale-100 animate-in slide-in-from-right-5 fade-in duration-300"
      )}
    >
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-gray-200/30 w-full">
        <div
          className={cn(
            "h-full transition-all duration-100 ease-linear",
            config.progressColor
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4 flex gap-3">
        {/* Icon with pulse animation */}
        <div className={cn("flex-shrink-0 relative", config.iconColor)}>
          <div className="absolute inset-0 animate-ping opacity-20">
            {config.icon}
          </div>
          <div className="relative">{config.icon}</div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={cn("text-sm font-bold mb-1", config.titleColor)}>
            {title}
          </h4>
          <p className={cn("text-sm leading-relaxed", config.messageColor)}>
            {message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className={cn(
            "flex-shrink-0 rounded-full p-1 transition-all duration-200 hover:bg-black/5 active:scale-95",
            config.iconColor,
            "hover:rotate-90"
          )}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
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
    <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
      <div className="pointer-events-auto space-y-3">
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

    // Limit to 5 toasts at a time
    setToasts((prev) => {
      const updated = [...prev, newToast];
      return updated.slice(-5);
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
