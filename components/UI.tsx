import React, { useState, useRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { X, AlertTriangle, Upload, File, CheckCircle2 } from "lucide-react";
import { createPortal } from "react-dom";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        "bg-primary-600 text-white hover:bg-primary-700 shadow-sm focus:ring-primary-500",
      secondary:
        "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm focus:ring-gray-500",
      outline:
        "bg-transparent border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500",
      ghost:
        "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500",
      danger:
        "bg-red-600 text-white hover:bg-red-700 shadow-sm focus:ring-red-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs font-medium",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// Card Component
export const Card: React.FC<{
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}> = ({ className, children, onClick }) => (
  <div
    onClick={onClick}
    className={cn(
      "bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden",
      onClick && "cursor-pointer hover:border-primary-300 transition-colors",
      className
    )}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = ({ className, children }) => (
  <div className={cn("px-6 py-4 border-b border-gray-50", className)}>
    {children}
  </div>
);

export const CardTitle: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = ({ className, children }) => (
  <h3 className={cn("text-lg font-bold text-gray-900", className)}>
    {children}
  </h3>
);

export const CardContent: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = ({ className, children }) => (
  <div className={cn("p-6", className)}>{children}</div>
);

// Badge Component
export const Badge: React.FC<{
  children?: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "primary";
  className?: string;
}> = ({ children, variant = "default", className }) => {
  const variants = {
    default: "bg-gray-100 text-gray-700 border-gray-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-sky-50 text-sky-700 border-sky-200",
    primary: "bg-primary-50 text-primary-700 border-primary-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

// Verified Badge Component - Shows checkmark for verified residents
export const VerifiedBadge: React.FC<{
  isVerified?: boolean;
  showText?: boolean;
  className?: string;
}> = ({ isVerified, showText = false, className }) => {
  if (!isVerified) return null;
  
  return (
    <span
      className={cn(
        "inline-flex items-center text-emerald-600",
        className
      )}
      title="Verified Resident"
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      {showText && <span className="ml-1 text-xs font-medium">Verified</span>}
    </span>
  );
};

// Input Component with Error Handling
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm",
            error
              ? "border-red-500 focus:ring-red-200 focus:border-red-500"
              : "border-gray-300",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1 animate-in slide-in-from-top-1">
            <AlertTriangle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

// Label Component
export const Label: React.FC<
  React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }
> = ({ className, children, required, ...props }) => (
  <label
    className={cn(
      "text-sm font-semibold text-gray-700 mb-1.5 block",
      className
    )}
    {...props}
  >
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm",
            error ? "border-red-500 focus:ring-red-200" : "border-gray-300",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

// Textarea Component
interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            "w-full min-h-[100px] rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm",
            error ? "border-red-500 focus:ring-red-200" : "border-gray-300",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// Toggle Component (Switch)
export const Toggle = ({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
}) => {
  return (
    <label className="inline-flex items-center cursor-pointer group">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
      />
      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 group-hover:bg-gray-300 peer-checked:group-hover:bg-primary-700 transition-colors"></div>
      {label && (
        <span className="ms-3 text-sm font-medium text-gray-900">{label}</span>
      )}
    </label>
  );
};

// Tabs Component
export const Tabs = ({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
}) => {
  return (
    <div className="flex space-x-1 rounded-xl bg-gray-100 p-1.5 mb-6 shadow-inner">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "w-full rounded-lg py-2 text-sm font-semibold leading-5 transition-all",
            activeTab === tab.id
              ? "bg-white text-primary-700 shadow ring-1 ring-black/5"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// Skeleton Component for loading states
export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse rounded-lg bg-gray-200/80", className)} />
);

// Hook for escape key handling in modals
const useModalEscapeKey = (isOpen: boolean, onClose: () => void) => {
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
};

// Modal Component
export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  className?: string;
}> = ({ isOpen, onClose, title, children, className }) => {
  // Handle Escape key
  useModalEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-gray-900/60 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card
        className={cn(
          "w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200",
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>{children}</CardContent>
      </Card>
    </div>,
    document.body
  );
};

// Confirm Dialog Component
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "danger";
  isLoading?: boolean;
}) => {
  // Handle Escape key
  useModalEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <Card className="w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
        <CardContent className="p-8 text-center">
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm",
              variant === "danger"
                ? "bg-red-50 text-red-600"
                : "bg-primary-50 text-primary-600"
            )}
          >
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 mb-8 leading-relaxed">{description}</p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="w-24"
            >
              {cancelText}
            </Button>
            <Button
              variant={variant}
              onClick={onConfirm}
              isLoading={isLoading}
              className="w-32 shadow-md"
            >
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// File Upload Component
interface FileUploadProps {
  value?: string;
  onChange: (base64: string) => void;
  label?: string;
  accept?: string;
  className?: string;
  helperText?: string;
  maxSizeMB?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  value,
  onChange,
  label = "Upload File",
  accept = "image/*",
  className,
  helperText = "SVG, PNG, JPG or GIF (Max 5MB)",
  maxSizeMB = 5,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    setError(null);
    // Size validation
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onChange(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className={className}>
      {label && <Label>{label}</Label>}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer min-h-[180px] group overflow-hidden",
          error
            ? "border-red-300 bg-red-50"
            : dragging
            ? "border-primary-500 bg-primary-50/50 scale-[1.02]"
            : "border-gray-300 hover:border-primary-400 hover:bg-gray-50",
          value ? "bg-white border-solid border-gray-200" : "bg-white"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !value && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
        />

        {value ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <img
              src={value}
              alt="Preview"
              className="max-h-[140px] rounded-lg object-contain mb-3 shadow-sm"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px] rounded-xl">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-red-50 hover:scale-105 transition-all text-sm flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Remove File
              </button>
            </div>
            <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full flex items-center mt-1">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Uploaded Successfully
            </span>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-sm",
                error
                  ? "bg-red-100 text-red-500"
                  : "bg-primary-50 text-primary-500"
              )}
            >
              {error ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>
            <div>
              {error ? (
                <p className="text-sm font-semibold text-red-600">{error}</p>
              ) : (
                <p className="text-sm font-semibold text-gray-900">
                  <span className="text-primary-600 hover:underline">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1 font-medium">
                {helperText}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
