import React from "react";
import {
  ErrorBoundary as ReactErrorBoundary,
  FallbackProps,
} from "react-error-boundary";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

/**
 * Default Error Fallback UI Component
 */
const ErrorFallback: React.FC<FallbackProps & { pageName?: string }> = ({
  error,
  resetErrorBoundary,
  pageName,
}) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {pageName ? `${pageName} crashed` : "Oops! Something went wrong"}
        </h2>
        <p className="text-gray-500 mb-6">
          We encountered an unexpected error. Don&apos;t worry, your data is
          safe.
        </p>

        {error && (
          <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left overflow-auto max-h-32">
            <p className="text-sm font-mono text-red-600">
              {error.message || error.toString()}
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={resetErrorBoundary}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <Home className="w-4 h-4 mr-2" />
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Page-level Error Fallback with full-screen layout
 */
const PageErrorFallback: React.FC<
  FallbackProps & {
    pageName?: string;
    onNavigateHome?: () => void;
  }
> = ({ error, resetErrorBoundary, pageName = "This page", onNavigateHome }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {pageName} crashed
        </h1>
        <p className="text-gray-500 mb-8">
          An unexpected error occurred while loading this page. Please try
          refreshing or go back to the dashboard.
        </p>

        {error && (
          <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left overflow-auto max-h-32">
            <p className="text-sm font-mono text-red-600">
              {error.message || error.toString()}
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={resetErrorBoundary}
            className="inline-flex items-center px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Error Boundary wrapper for components
 * Uses react-error-boundary for robust error handling
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: { componentStack: string }) => void;
  onReset?: () => void;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  fallback,
  onError,
  onReset,
}) => {
  const handleError = (error: Error, info: { componentStack: string }) => {
    console.error("Error Boundary caught an error:", error, info);
    onError?.(error, info);
  };

  if (fallback) {
    return (
      <ReactErrorBoundary
        fallback={fallback as React.ReactElement}
        onError={handleError}
        onReset={onReset}
      >
        {children}
      </ReactErrorBoundary>
    );
  }

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={onReset}
    >
      {children}
    </ReactErrorBoundary>
  );
};

/**
 * Page-level Error Boundary with navigation support
 */
interface PageErrorBoundaryProps {
  children: React.ReactNode;
  pageName?: string;
  onNavigateHome?: () => void;
}

export const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({
  children,
  pageName = "This page",
  onNavigateHome,
}) => {
  const handleError = (error: Error, info: { componentStack: string }) => {
    console.error(`Error in ${pageName}:`, error, info);
  };

  const handleReset = () => {
    onNavigateHome?.();
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={(props) => (
        <PageErrorFallback
          {...props}
          pageName={pageName}
          onNavigateHome={onNavigateHome}
        />
      )}
      onError={handleError}
      onReset={handleReset}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
