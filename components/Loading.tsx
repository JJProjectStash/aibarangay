import React from "react";
import { cn, Skeleton } from "./UI";
import { Loader2 } from "lucide-react";

/**
 * Full page loading spinner
 */
export const PageLoader: React.FC<{ message?: string }> = ({
  message = "Loading...",
}) => (
  <div className="min-h-[400px] flex flex-col items-center justify-center">
    <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
    <p className="text-gray-500 font-medium">{message}</p>
  </div>
);

/**
 * Inline loading spinner
 */
export const InlineLoader: React.FC<{
  size?: "sm" | "md" | "lg";
  className?: string;
}> = ({ size = "md", className }) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <Loader2
      className={cn("animate-spin text-primary-600", sizes[size], className)}
    />
  );
};

/**
 * Loading overlay for cards or sections
 */
export const LoadingOverlay: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ isLoading, children, className }) => (
  <div className={cn("relative", className)}>
    {children}
    {isLoading && (
      <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-lg">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )}
  </div>
);

/**
 * Skeleton loaders for different content types
 */

// Table row skeleton
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({
  columns = 5,
}) => (
  <tr className="animate-pulse">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

// Table skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5,
}) => (
  <tbody>
    {Array.from({ length: rows }).map((_, i) => (
      <TableRowSkeleton key={i} columns={columns} />
    ))}
  </tbody>
);

// Card skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div
    className={cn(
      "bg-white rounded-xl border border-gray-200 p-6 animate-pulse",
      className
    )}
  >
    <div className="flex items-start gap-4 mb-4">
      <Skeleton className="w-12 h-12 rounded-lg" />
      <div className="flex-1">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-5/6" />
  </div>
);

// List item skeleton
export const ListItemSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 p-4 animate-pulse">
    <Skeleton className="w-10 h-10 rounded-full" />
    <div className="flex-1">
      <Skeleton className="h-4 w-48 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
    <Skeleton className="h-8 w-20 rounded-lg" />
  </div>
);

// Stats card skeleton
export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="w-10 h-10 rounded-lg" />
    </div>
    <Skeleton className="h-8 w-20 mb-2" />
    <Skeleton className="h-3 w-32" />
  </div>
);

// Grid skeleton for cards
export const CardGridSkeleton: React.FC<{
  count?: number;
  columns?: number;
}> = ({ count = 6, columns = 3 }) => (
  <div
    className={cn("grid gap-6", {
      "grid-cols-1": columns === 1,
      "grid-cols-1 md:grid-cols-2": columns === 2,
      "grid-cols-1 md:grid-cols-2 lg:grid-cols-3": columns === 3,
      "grid-cols-1 md:grid-cols-2 lg:grid-cols-4": columns === 4,
    })}
  >
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

// Dashboard skeleton
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Stats row */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>

    {/* Content area */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CardSkeleton className="h-80" />
      <CardSkeleton className="h-80" />
    </div>
  </div>
);

// Profile skeleton
export const ProfileSkeleton: React.FC = () => (
  <div className="max-w-2xl mx-auto animate-pulse">
    <div className="flex items-center gap-6 mb-8">
      <Skeleton className="w-24 h-24 rounded-full" />
      <div>
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Empty state component
 */
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => (
  <div className={cn("text-center py-12", className)}>
    {icon && (
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
    {description && (
      <p className="text-gray-500 mb-4 max-w-sm mx-auto">{description}</p>
    )}
    {action}
  </div>
);

/**
 * Error state component
 */
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "An error occurred while loading the data. Please try again.",
  onRetry,
  className,
}) => (
  <div className={cn("text-center py-12", className)}>
    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg
        className="w-8 h-8 text-red-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
    <p className="text-gray-500 mb-4 max-w-sm mx-auto">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Try Again
      </button>
    )}
  </div>
);

export default {
  PageLoader,
  InlineLoader,
  LoadingOverlay,
  TableSkeleton,
  CardSkeleton,
  CardGridSkeleton,
  DashboardSkeleton,
  EmptyState,
  ErrorState,
};
