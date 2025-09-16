/**
 * React Query Provider for global state management.
 * 
 * Provides React Query client configuration with proper error handling,
 * caching strategies, and retry logic for the Event Tracker application.
 * 
 * Author: Generated for Mini Event Tracker
 * Created: September 16, 2025
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import toast from 'react-hot-toast';

// Create React Query client with optimized configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 2 times
      retry: 2,
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,
      // Error handling
      onError: (error) => {
        console.error('Query error:', error);
        const message = error?.response?.data?.message || 
                       error?.message || 
                       'Something went wrong. Please try again.';
        toast.error(message);
      },
    },
    mutations: {
      // Error handling for mutations
      onError: (error) => {
        console.error('Mutation error:', error);
        const message = error?.response?.data?.message || 
                       error?.message || 
                       'Operation failed. Please try again.';
        toast.error(message);
      },
      // Success handling for mutations
      onSuccess: (data) => {
        if (data?.message) {
          toast.success(data.message);
        }
      },
    },
  },
});

/**
 * Query Provider component that wraps the entire app
 */
export default function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show React Query DevTools in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}