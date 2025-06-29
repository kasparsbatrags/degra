import { useState, useEffect } from 'react';
import { useOnlineStatus } from '../hooks/useNetwork';
import { isOnline } from '../services/networkService';

export function useNetworkState() {
  const isConnected = useOnlineStatus();
  const [isStrongConnection, setIsStrongConnection] = useState(true);

  useEffect(() => {
    // Placeholder for a more advanced network strength check
    setIsStrongConnection(isConnected);
  }, [isConnected]);

  return { isConnected, isStrongConnection };
}

export async function isConnected(): Promise<boolean> {
  return await isOnline();
}

export async function throttleNetworkRequest<T>(
  requestFn: () => Promise<T>,
  options: {
    priorityLevel: 'high' | 'low';
    retryCount: number;
    timeout: number;
  }
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    let attempts = 0;

    async function tryRequest() {
      try {
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        attempts++;
        if (attempts < options.retryCount) {
          setTimeout(tryRequest, options.timeout * attempts);
        } else {
          reject(error);
        }
      }
    }

    await tryRequest();
  });
}
