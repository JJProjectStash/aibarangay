import React, { useState, useCallback, useEffect, useRef } from "react";

/**
 * Hook state for async operations
 */
export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
  isError: boolean;
}

/**
 * Custom hook for managing async operations with loading, error, and success states
 */
export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  immediate = false
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
    isSuccess: false,
    isError: false,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: any[]) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        isSuccess: false,
        isError: false,
      }));

      try {
        const data = await asyncFunction(...args);
        if (mountedRef.current) {
          setState({
            data,
            isLoading: false,
            error: null,
            isSuccess: true,
            isError: false,
          });
        }
        return data;
      } catch (error) {
        if (mountedRef.current) {
          setState({
            data: null,
            isLoading: false,
            error: error as Error,
            isSuccess: false,
            isError: true,
          });
        }
        throw error;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isSuccess: false,
      isError: false,
    });
  }, []);

  return { ...state, execute, reset };
}

/**
 * Hook for pagination with async data fetching
 */
export interface PaginationState<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  isLoading: boolean;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
}

export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
): PaginationState<T> & {
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
} {
  const { initialPage = 1, pageSize: initialPageSize = 10 } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset to page 1 if current page is out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedItems = items.slice(startIndex, endIndex);

  const setPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  }, []);

  return {
    items: paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    isLoading: false,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    setPage,
    nextPage,
    prevPage,
    setPageSize,
  };
}

/**
 * Debounce hook for search inputs
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for handling Escape key to close modals/dropdowns
 */
export function useEscapeKey(onEscape: () => void, isActive: boolean = true) {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscape();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onEscape, isActive]);
}

/**
 * Hook for handling keyboard shortcuts
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: { ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean } = {}
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { ctrlKey = false, shiftKey = false, altKey = false } = options;

      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === ctrlKey &&
        event.shiftKey === shiftKey &&
        event.altKey === altKey
      ) {
        event.preventDefault();
        callback();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, options]);
}

/**
 * Hook for click outside detection (useful for dropdowns)
 */
export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  callback: () => void,
  isActive: boolean = true
) {
  useEffect(() => {
    if (!isActive) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, callback, isActive]);
}

/**
 * Hook for retry logic with exponential backoff
 */
export function useRetry<T>(
  asyncFunction: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
  } = {}
) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
  } = options;

  const [state, setState] = useState<{
    data: T | null;
    isLoading: boolean;
    error: Error | null;
    retryCount: number;
  }>({
    data: null,
    isLoading: false,
    error: null,
    retryCount: 0,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    let lastError: Error | null = null;
    let delay = initialDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const data = await asyncFunction();
        if (mountedRef.current) {
          setState({
            data,
            isLoading: false,
            error: null,
            retryCount: attempt,
          });
        }
        return data;
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay = Math.min(delay * backoffFactor, maxDelay);

          if (mountedRef.current) {
            setState((prev) => ({ ...prev, retryCount: attempt + 1 }));
          }
        }
      }
    }

    if (mountedRef.current) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: lastError,
        retryCount: maxRetries,
      }));
    }
    throw lastError;
  }, [asyncFunction, maxRetries, initialDelay, maxDelay, backoffFactor]);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null, retryCount: 0 });
  }, []);

  return { ...state, execute, reset };
}

/**
 * Hook for local storage with automatic sync
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}
