import { useState, useCallback, useEffect, useRef } from "react";

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
