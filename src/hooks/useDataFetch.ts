import { useState, useCallback, useRef, useEffect } from 'react';

export interface DataFetchState<T> {
  data: T | null;
  isLoading: boolean;
  isRefetching: boolean;
  error: Error | null;
  errorMessage: string | null;
  retryCount: number;
  lastFetched: Date | null;
  isStale: boolean;
}

export interface DataFetchConfig<T> {
  /** Initial data before fetch */
  initialData?: T;
  /** Enable automatic fetching on mount */
  autoFetch?: boolean;
  /** Dependencies that trigger refetch when changed */
  dependencies?: any[];
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Cache time in milliseconds before data is considered stale */
  staleTime?: number;
  /** Maximum retry attempts on error */
  maxRetries?: number;
  /** Delay between retries in milliseconds */
  retryDelay?: number;
  /** Transform response data */
  transform?: (data: any) => T;
  /** Path to extract data from response (e.g., 'data.items') */
  responsePath?: string;
  /** Enable refetch on window focus */
  refetchOnFocus?: boolean;
  /** Enable refetch on reconnect */
  refetchOnReconnect?: boolean;
  /** Callback on successful fetch */
  onSuccess?: (data: T) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Callback when loading state changes */
  onLoadingChange?: (isLoading: boolean) => void;
}

export interface DataFetchActions<T> {
  /** Fetch data with optional parameters */
  fetch: (params?: Record<string, any>) => Promise<T | null>;
  /** Refetch with last used parameters */
  refetch: () => Promise<T | null>;
  /** Reset state to initial */
  reset: () => void;
  /** Clear error state */
  clearError: () => void;
  /** Manually set data */
  setData: (data: T | null) => void;
  /** Retry last failed fetch */
  retry: () => Promise<T | null>;
  /** Cancel ongoing fetch */
  cancel: () => void;
}

export interface UseDataFetchReturn<T> extends DataFetchState<T>, DataFetchActions<T> {
  /** Skeleton-friendly loading state (true during initial load) */
  showSkeleton: boolean;
  /** Whether any data exists (for conditional rendering) */
  hasData: boolean;
  /** Whether to show error UI */
  showError: boolean;
  /** Whether to show empty state */
  showEmpty: boolean;
  /** Combined status for easy conditional rendering */
  status: 'idle' | 'loading' | 'success' | 'error';
}

// Helper to get nested value from object
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

export function useDataFetch<T = any>(
  fetcher: ((params?: Record<string, any>) => Promise<T>) | string,
  config: DataFetchConfig<T> = {}
): UseDataFetchReturn<T> {
  const {
    initialData = null,
    autoFetch = false,
    dependencies = [],
    debounceMs = 0,
    staleTime = 0,
    maxRetries = 3,
    retryDelay = 1000,
    transform,
    responsePath,
    refetchOnFocus = false,
    refetchOnReconnect = false,
    onSuccess,
    onError,
    onLoadingChange,
  } = config;

  const [state, setState] = useState<DataFetchState<T>>({
    data: initialData as T | null,
    isLoading: false,
    isRefetching: false,
    error: null,
    errorMessage: null,
    retryCount: 0,
    lastFetched: null,
    isStale: true,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastParamsRef = useRef<Record<string, any> | undefined>(undefined);
  const isMountedRef = useRef(true);
  const hasInitialFetchRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Check if data is stale
  useEffect(() => {
    if (staleTime > 0 && state.lastFetched) {
      const checkStale = () => {
        const now = new Date();
        const timeSinceLastFetch = now.getTime() - state.lastFetched!.getTime();
        if (timeSinceLastFetch > staleTime && !state.isStale) {
          setState(prev => ({ ...prev, isStale: true }));
        }
      };

      const interval = setInterval(checkStale, staleTime / 2);
      return () => clearInterval(interval);
    }
  }, [staleTime, state.lastFetched, state.isStale]);

  // Refetch on focus
  useEffect(() => {
    if (!refetchOnFocus) return;

    const handleFocus = () => {
      if (state.isStale && hasInitialFetchRef.current) {
        refetch();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnFocus, state.isStale]);

  // Refetch on reconnect
  useEffect(() => {
    if (!refetchOnReconnect) return;

    const handleOnline = () => {
      if (hasInitialFetchRef.current) {
        refetch();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [refetchOnReconnect]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  const fetchData = useCallback(async (
    params?: Record<string, any>,
    isRetry = false
  ): Promise<T | null> => {
    // Cancel any ongoing request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const isRefetch = state.data !== null;

    setState(prev => ({
      ...prev,
      isLoading: !isRefetch,
      isRefetching: isRefetch,
      error: isRetry ? prev.error : null,
      errorMessage: isRetry ? prev.errorMessage : null,
    }));

    onLoadingChange?.(true);

    try {
      let result: any;

      if (typeof fetcher === 'string') {
        // URL-based fetching
        let url = fetcher;
        if (params) {
          const searchParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              searchParams.append(key, String(value));
            }
          });
          const separator = url.includes('?') ? '&' : '?';
          url = `${url}${separator}${searchParams.toString()}`;
        }

        const response = await globalThis.fetch(url, {
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        result = await response.json();
      } else {
        // Function-based fetching
        result = await fetcher(params);
      }

      // Extract data from response path
      if (responsePath) {
        result = getNestedValue(result, responsePath);
      }

      // Transform data
      if (transform) {
        result = transform(result);
      }

      if (!isMountedRef.current) return null;

      setState(prev => ({
        ...prev,
        data: result,
        isLoading: false,
        isRefetching: false,
        error: null,
        errorMessage: null,
        retryCount: 0,
        lastFetched: new Date(),
        isStale: false,
      }));

      onLoadingChange?.(false);
      onSuccess?.(result);
      hasInitialFetchRef.current = true;
      lastParamsRef.current = params;

      return result;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return null;
      }

      if (!isMountedRef.current) return null;

      const errorObj = error instanceof Error ? error : new Error(String(error));

      setState(prev => ({
        ...prev,
        isLoading: false,
        isRefetching: false,
        error: errorObj,
        errorMessage: errorObj.message,
        retryCount: prev.retryCount + 1,
      }));

      onLoadingChange?.(false);
      onError?.(errorObj);

      return null;
    }
  }, [fetcher, responsePath, transform, onSuccess, onError, onLoadingChange, state.data]);

  const fetchWithDebounce = useCallback(async (params?: Record<string, any>): Promise<T | null> => {
    if (debounceMs > 0) {
      return new Promise((resolve) => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(async () => {
          const result = await fetchData(params);
          resolve(result);
        }, debounceMs);
      });
    }

    return fetchData(params);
  }, [fetchData, debounceMs]);

  const refetch = useCallback(async (): Promise<T | null> => {
    return fetchData(lastParamsRef.current);
  }, [fetchData]);

  const retry = useCallback(async (): Promise<T | null> => {
    if (state.retryCount >= maxRetries) {
      return null;
    }

    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, retryDelay * state.retryCount));
    return fetchData(lastParamsRef.current, true);
  }, [fetchData, state.retryCount, maxRetries, retryDelay]);

  const reset = useCallback(() => {
    cancel();
    setState({
      data: initialData as T | null,
      isLoading: false,
      isRefetching: false,
      error: null,
      errorMessage: null,
      retryCount: 0,
      lastFetched: null,
      isStale: true,
    });
    hasInitialFetchRef.current = false;
    lastParamsRef.current = undefined;
  }, [cancel, initialData]);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      errorMessage: null,
      retryCount: 0,
    }));
  }, []);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({
      ...prev,
      data,
      lastFetched: new Date(),
      isStale: false,
    }));
  }, []);

  // Auto fetch on mount or dependency change
  useEffect(() => {
    if (autoFetch) {
      fetchWithDebounce();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, ...dependencies]);

  // Computed states for UI rendering
  const hasData = state.data !== null && (Array.isArray(state.data) ? state.data.length > 0 : true);
  const showSkeleton = state.isLoading && !hasData;
  const showError = state.error !== null && !state.isLoading && !hasData;
  const showEmpty = !state.isLoading && !state.error && !hasData && hasInitialFetchRef.current;

  const status: 'idle' | 'loading' | 'success' | 'error' = 
    state.isLoading ? 'loading' :
    state.error ? 'error' :
    hasData ? 'success' : 'idle';

  return {
    // State
    ...state,
    
    // Computed
    showSkeleton,
    hasData,
    showError,
    showEmpty,
    status,

    // Actions
    fetch: fetchWithDebounce,
    refetch,
    reset,
    clearError,
    setData,
    retry,
    cancel,
  };
}

// Convenience hook for paginated data
export interface UsePaginatedFetchConfig<T> extends DataFetchConfig<T[]> {
  pageSize?: number;
  initialPage?: number;
}

export interface UsePaginatedFetchReturn<T> extends Omit<UseDataFetchReturn<T[]>, 'fetch'> {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  fetchPage: (page: number) => Promise<T[] | null>;
  nextPage: () => Promise<T[] | null>;
  prevPage: () => Promise<T[] | null>;
  setPageSize: (size: number) => void;
}

export function usePaginatedFetch<T = any>(
  fetcher: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>,
  config: UsePaginatedFetchConfig<T> = {}
): UsePaginatedFetchReturn<T> {
  const { pageSize: initialPageSize = 20, initialPage = 1, ...restConfig } = config;
  
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  const wrappedFetcher = useCallback(async () => {
    const result = await fetcher(page, pageSize);
    setTotalItems(result.total);
    return result.data;
  }, [fetcher, page, pageSize]);

  const fetchResult = useDataFetch<T[]>(wrappedFetcher, {
    ...restConfig,
    initialData: [],
    dependencies: [page, pageSize, ...(config.dependencies || [])],
    autoFetch: true,
  });

  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const fetchPage = useCallback(async (newPage: number) => {
    setPage(newPage);
    return fetchResult.refetch();
  }, [fetchResult.refetch]);

  const nextPage = useCallback(async () => {
    if (hasNextPage) {
      return fetchPage(page + 1);
    }
    return null;
  }, [hasNextPage, page, fetchPage]);

  const prevPage = useCallback(async () => {
    if (hasPrevPage) {
      return fetchPage(page - 1);
    }
    return null;
  }, [hasPrevPage, page, fetchPage]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  return {
    ...fetchResult,
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage,
    hasPrevPage,
    fetchPage,
    nextPage,
    prevPage,
    setPageSize,
  };
}

// Convenience hook for infinite scroll
export interface UseInfiniteFetchConfig<T> extends DataFetchConfig<T[]> {
  pageSize?: number;
}

export interface UseInfiniteFetchReturn<T> extends Omit<UseDataFetchReturn<T[]>, 'fetch'> {
  items: T[];
  page: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => Promise<void>;
  reset: () => void;
}

export function useInfiniteFetch<T = any>(
  fetcher: (page: number, pageSize: number) => Promise<{ data: T[]; hasMore: boolean }>,
  config: UseInfiniteFetchConfig<T> = {}
): UseInfiniteFetchReturn<T> {
  const { pageSize = 20, ...restConfig } = config;
  
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const wrappedFetcher = useCallback(async () => {
    const result = await fetcher(page, pageSize);
    setHasMore(result.hasMore);
    
    if (page === 1) {
      setItems(result.data);
    } else {
      setItems(prev => [...prev, ...result.data]);
    }
    
    return result.data;
  }, [fetcher, page, pageSize]);

  const fetchResult = useDataFetch<T[]>(wrappedFetcher, {
    ...restConfig,
    initialData: [],
    autoFetch: page === 1,
  });

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || fetchResult.isLoading) return;
    
    setIsLoadingMore(true);
    setPage(prev => prev + 1);
    await fetchResult.refetch();
    setIsLoadingMore(false);
  }, [hasMore, isLoadingMore, fetchResult.isLoading, fetchResult.refetch]);

  const reset = useCallback(() => {
    setPage(1);
    setItems([]);
    setHasMore(true);
    fetchResult.reset();
  }, [fetchResult.reset]);

  return {
    ...fetchResult,
    data: items,
    items,
    page,
    hasMore,
    isLoadingMore,
    loadMore,
    reset,
  };
}

export default useDataFetch;
