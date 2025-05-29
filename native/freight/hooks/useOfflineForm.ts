import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { offlineManager } from '@/services/OfflineManager';
import { SYNC_KEYS } from '@/config/offlineConfig';
import { useNetworkState } from '@/utils/networkUtils';

/**
 * Offline formas konfigurācija
 */
export interface OfflineFormConfig<T> {
  queueType?: string;
  priority?: 'high' | 'medium' | 'low';
  maxRetries?: number;
  onlineSubmitEndpoint: string;
  offlineSubmitEndpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  transformData?: (data: T) => any;
  onSuccess?: (data: T, isOffline: boolean) => void;
  onError?: (error: string, isOffline: boolean) => void;
  showOfflineAlert?: boolean;
}

/**
 * Offline formas rezultāts
 */
export interface UseOfflineFormResult<T> {
  isSubmitting: boolean;
  submitForm: (data: T, axiosInstance?: any) => Promise<void>;
  submitOffline: (data: T) => Promise<string>;
  hasPendingSubmissions: () => Promise<boolean>;
  clearPendingSubmissions: () => Promise<void>;
  lastSubmissionId: string | null;
}

/**
 * Hook offline formu pārvaldībai
 */
export function useOfflineForm<T>(
  config: OfflineFormConfig<T>
): UseOfflineFormResult<T> {
  const {
    queueType = SYNC_KEYS.TRUCK_ROUTES,
    priority = 'medium',
    maxRetries,
    onlineSubmitEndpoint,
    offlineSubmitEndpoint,
    method,
    transformData,
    onSuccess,
    onError,
    showOfflineAlert = true
  } = config;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionId, setLastSubmissionId] = useState<string | null>(null);
  const { isConnected } = useNetworkState();
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useState(() => {
    return () => {
      mountedRef.current = false;
    };
  });

  /**
   * Galvenā submit funkcija
   */
  const submitForm = useCallback(async (data: T, axiosInstance?: any) => {
    if (!mountedRef.current) return;

    setIsSubmitting(true);
    
    try {
      const transformedData = transformData ? transformData(data) : data;

      if (isConnected && axiosInstance) {
        // Online submission
        try {
          let response;
          
          switch (method) {
            case 'POST':
              response = await axiosInstance.post(onlineSubmitEndpoint, transformedData);
              break;
            case 'PUT':
              response = await axiosInstance.put(onlineSubmitEndpoint, transformedData);
              break;
            case 'PATCH':
              response = await axiosInstance.patch(onlineSubmitEndpoint, transformedData);
              break;
            case 'DELETE':
              response = await axiosInstance.delete(onlineSubmitEndpoint);
              break;
            default:
              throw new Error(`Unsupported method: ${method}`);
          }

          if (mountedRef.current && onSuccess) {
            onSuccess(data, false);
          }
        } catch (error) {
          console.error('Online submission failed:', error);
          
          // Ja online submission fails, mēģināt offline
          const submissionId = await submitOffline(data);
          setLastSubmissionId(submissionId);
          
          if (showOfflineAlert) {
            Alert.alert(
              "Offline režīms",
              "Dati ir saglabāti lokāli un tiks sinhronizēti, kad būs pieejams internets.",
              [{ text: "OK" }]
            );
          }
          
          if (mountedRef.current && onSuccess) {
            onSuccess(data, true);
          }
        }
      } else {
        // Offline submission
        const submissionId = await submitOffline(data);
        setLastSubmissionId(submissionId);
        
        if (showOfflineAlert) {
          Alert.alert(
            "Offline režīms",
            "Dati ir saglabāti lokāli un tiks sinhronizēti, kad būs pieejams internets.",
            [{ text: "OK" }]
          );
        }
        
        if (mountedRef.current && onSuccess) {
          onSuccess(data, true);
        }
      }
    } catch (error) {
      console.error('Form submission failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (mountedRef.current && onError) {
        onError(errorMessage, !isConnected);
      }
      
      Alert.alert(
        "Kļūda",
        "Neizdevās saglabāt datus. Lūdzu, mēģiniet vēlreiz.",
        [{ text: "OK" }]
      );
    } finally {
      if (mountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }, [
    isConnected,
    method,
    onlineSubmitEndpoint,
    transformData,
    onSuccess,
    onError,
    showOfflineAlert
  ]);

  /**
   * Offline submission funkcija
   */
  const submitOffline = useCallback(async (data: T): Promise<string> => {
    try {
      const transformedData = transformData ? transformData(data) : data;
      
      const submissionId = await offlineManager.addOfflineOperation(
        'form_submission',
        method,
        offlineSubmitEndpoint,
        transformedData,
        {
          priority,
          maxRetries,
          queueType
        }
      );
      
      return submissionId;
    } catch (error) {
      console.error('Offline submission failed:', error);
      throw error;
    }
  }, [method, offlineSubmitEndpoint, transformData, priority, maxRetries, queueType]);

  /**
   * Pārbaudīt, vai ir pending submissions
   */
  const hasPendingSubmissions = useCallback(async (): Promise<boolean> => {
    try {
      // Šeit varētu būt specifiskāka loģika, lai pārbaudītu tikai šīs formas submissions
      // Pagaidām izmantojam vispārējo pending operations check
      const status = await offlineManager.getOfflineStatus();
      return status.pendingOperations > 0;
    } catch (error) {
      console.error('Error checking pending submissions:', error);
      return false;
    }
  }, []);

  /**
   * Notīrīt pending submissions
   */
  const clearPendingSubmissions = useCallback(async (): Promise<void> => {
    try {
      // Šeit varētu būt specifiskāka loģika, lai notīrītu tikai šīs formas submissions
      // Pagaidām izmantojam vispārējo queue clear
      await offlineManager.clearCache();
      setLastSubmissionId(null);
    } catch (error) {
      console.error('Error clearing pending submissions:', error);
    }
  }, []);

  return {
    isSubmitting,
    submitForm,
    submitOffline,
    hasPendingSubmissions,
    clearPendingSubmissions,
    lastSubmissionId
  };
}

/**
 * Specializēti hooks dažādiem formu tipiem
 */

// Hook truck route formām
export function useTruckRouteForm() {
  return useOfflineForm({
    queueType: SYNC_KEYS.TRUCK_ROUTES,
    priority: 'high',
    onlineSubmitEndpoint: '/truck-routes',
    offlineSubmitEndpoint: '/truck-routes',
    method: 'POST',
    showOfflineAlert: true
  });
}

// Hook objektu izveidošanai
export function useObjectForm() {
  return useOfflineForm({
    queueType: SYNC_KEYS.OBJECTS,
    priority: 'medium',
    onlineSubmitEndpoint: '/objects',
    offlineSubmitEndpoint: '/objects',
    method: 'POST',
    showOfflineAlert: true
  });
}

// Hook profila atjaunināšanai
export function useProfileForm() {
  return useOfflineForm({
    queueType: SYNC_KEYS.PROFILE_UPDATES,
    priority: 'low',
    onlineSubmitEndpoint: '/profile',
    offlineSubmitEndpoint: '/profile',
    method: 'PUT',
    showOfflineAlert: false // Profila atjauninājumi nav tik kritiski
  });
}
