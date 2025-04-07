import {useEffect, useState} from 'react'
import {isWeb} from '../utils/platformUtils'

/**
 * Hook that debounces a value
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Platformai specifisks delay - web platformai mazāks delay
    const platformDelay = isWeb ? Math.min(delay, 150) : delay;
    
    // Uzstāda taimeri, lai atjauninātu vērtību pēc delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, platformDelay);

    // Notīra taimeri, ja vērtība mainās pirms delay beigām
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook that debounces a function
 * @param fn The function to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Platformai specifisks delay - web platformai mazāks delay
  const platformDelay = isWeb ? Math.min(delay, 150) : delay;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      fn(...args);
      setTimeoutId(null);
    }, platformDelay);

    setTimeoutId(newTimeoutId);
  };
}

/**
 * Hook that throttles a function
 * @param fn The function to throttle
 * @param delay The delay in milliseconds
 * @returns The throttled function
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  const [lastCall, setLastCall] = useState(0);

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      fn(...args);
      setLastCall(now);
    }
  };
}

/**
 * Hook that memoizes a value
 * @param value The value to memoize
 * @param dependencies The dependencies to watch
 * @returns The memoized value
 */
export function useMemoizedValue<T>(value: T, dependencies: any[]): T {
  const [memoizedValue, setMemoizedValue] = useState<T>(value);

  useEffect(() => {
    setMemoizedValue(value);
  }, dependencies);

  return memoizedValue;
}
