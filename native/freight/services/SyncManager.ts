import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { getSyncConfig, SYNC_KEYS, validateSyncKey } from '@/config/offlineConfig';
import { v4 as uuidv4 } from 'uuid';

/**
 * Sinhronizācijas operācija
 */
export interface SyncOperation {
  id: string;
  type: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: 'high' | 'medium' | 'low';
  dependencies?: string[]; // Citu operāciju ID, kas jāizpilda pirms šīs
}

/**
 * Sinhronizācijas rezultāts
 */
export interface SyncResult {
  id: string;
  success: boolean;
  error?: string;
  response?: any;
  timestamp: number;
}

/**
 * Sync queue statistika
 */
export interface SyncQueueStats {
  totalOperations: number;
  pendingOperations: number;
  failedOperations: number;
  lastSyncAttempt: number | null;
  lastSuccessfulSync: number | null;
}

/**
 * Centralizēts sinhronizācijas pārvaldnieks, kas koordinē visas offline operācijas
 */
export class SyncManager {
  private static instance: SyncManager;
  private syncInProgress = false;
  private networkListener: (() => void) | null = null;
  private backgroundSyncInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.setupNetworkListener();
    this.setupBackgroundSync();
  }

  /**
   * Singleton instance
   */
  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  /**
   * Pievienot operāciju sync queue
   */
  async addToQueue(
    queueType: string,
    operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>
  ): Promise<string> {
    try {
      if (!validateSyncKey(queueType)) {
        throw new Error(`Invalid sync queue type: ${queueType}`);
      }

      const config = getSyncConfig();
      const operationId = uuidv4();
      
      const syncOperation: SyncOperation = {
        ...operation,
        id: operationId,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: operation.maxRetries || config.maxRetries
      };

      const queue = await this.getQueue(queueType);
      queue.push(syncOperation);
      
      // Kārtot pēc prioritātes un timestamp
      queue.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Augstāka prioritāte pirmā
        }
        
        return a.timestamp - b.timestamp; // Vecākas operācijas pirmās
      });

      await this.saveQueue(queueType, queue);
      
      // Mēģināt sinhronizēt uzreiz, ja ir savienojums
      this.attemptSync();
      
      return operationId;
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      throw error;
    }
  }

  /**
   * Apstrādāt konkrētu queue
   */
  async processQueue(queueType: string, axiosInstance?: any): Promise<SyncResult[]> {
    try {
      if (!validateSyncKey(queueType)) {
        throw new Error(`Invalid sync queue type: ${queueType}`);
      }

      const queue = await this.getQueue(queueType);
      if (queue.length === 0) {
        return [];
      }

      const results: SyncResult[] = [];
      const config = getSyncConfig();
      const remainingOperations: SyncOperation[] = [];

      // Apstrādāt operācijas batch-os
      const batchSize = config.batchSize;
      for (let i = 0; i < queue.length; i += batchSize) {
        const batch = queue.slice(i, i + batchSize);
        
        for (const operation of batch) {
          try {
            // Pārbaudīt dependencies
            if (operation.dependencies && operation.dependencies.length > 0) {
              const dependenciesMet = await this.checkDependencies(operation.dependencies, results);
              if (!dependenciesMet) {
                remainingOperations.push(operation);
                continue;
              }
            }

            const result = await this.executeOperation(operation, axiosInstance);
            results.push(result);

            if (!result.success) {
              operation.retryCount++;
              
              if (operation.retryCount < operation.maxRetries) {
                // Pievienot atpakaļ queue ar delay
                setTimeout(() => {
                  remainingOperations.push(operation);
                }, config.retryDelay * Math.pow(config.backoffMultiplier, operation.retryCount));
              } else {
                console.error(`Operation ${operation.id} failed after ${operation.maxRetries} retries`);
              }
            }
          } catch (error) {
            console.error('Error processing operation:', error);
            
            operation.retryCount++;
            if (operation.retryCount < operation.maxRetries) {
              remainingOperations.push(operation);
            }
            
            results.push({
              id: operation.id,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: Date.now()
            });
          }
        }
      }

      // Saglabāt atlikušās operācijas
      await this.saveQueue(queueType, remainingOperations);
      
      return results;
    } catch (error) {
      console.error('Error processing sync queue:', error);
      throw error;
    }
  }

  /**
   * Sinhronizēt visas queue
   */
  async syncAll(axiosInstances?: Record<string, any>): Promise<Record<string, SyncResult[]>> {
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping');
      return {};
    }

    try {
      this.syncInProgress = true;
      const results: Record<string, SyncResult[]> = {};

      // Pārbaudīt tīkla savienojumu
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.log('No network connection, skipping sync');
        return {};
      }

      // Sinhronizēt katru queue
      for (const queueType of Object.values(SYNC_KEYS)) {
        try {
          const axiosInstance = axiosInstances?.[queueType];
          const queueResults = await this.processQueue(queueType, axiosInstance);
          results[queueType] = queueResults;
        } catch (error) {
          console.error(`Error syncing queue ${queueType}:`, error);
          results[queueType] = [];
        }
      }

      // Atjaunināt pēdējās sinhronizācijas laiku
      await AsyncStorage.setItem('last_sync_timestamp', Date.now().toString());

      return results;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Iegūt queue statistiku
   */
  async getQueueStats(queueType: string): Promise<SyncQueueStats> {
    try {
      const queue = await this.getQueue(queueType);
      const failedOperations = queue.filter(op => op.retryCount >= op.maxRetries);
      
      const lastSyncStr = await AsyncStorage.getItem('last_sync_timestamp');
      const lastSyncAttemptStr = await AsyncStorage.getItem('last_sync_attempt_timestamp');
      
      return {
        totalOperations: queue.length,
        pendingOperations: queue.length - failedOperations.length,
        failedOperations: failedOperations.length,
        lastSyncAttempt: lastSyncAttemptStr ? parseInt(lastSyncAttemptStr) : null,
        lastSuccessfulSync: lastSyncStr ? parseInt(lastSyncStr) : null
      };
    } catch (error) {
      console.error('Error getting queue stats:', error);
      return {
        totalOperations: 0,
        pendingOperations: 0,
        failedOperations: 0,
        lastSyncAttempt: null,
        lastSuccessfulSync: null
      };
    }
  }

  /**
   * Tīrīt konkrētu queue
   */
  async clearQueue(queueType: string): Promise<void> {
    try {
      if (!validateSyncKey(queueType)) {
        throw new Error(`Invalid sync queue type: ${queueType}`);
      }
      
      await AsyncStorage.removeItem(queueType);
    } catch (error) {
      console.error('Error clearing sync queue:', error);
      throw error;
    }
  }

  /**
   * Tīrīt visas queue
   */
  async clearAllQueues(): Promise<void> {
    try {
      const promises = Object.values(SYNC_KEYS).map(queueType => 
        AsyncStorage.removeItem(queueType)
      );
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error clearing all sync queues:', error);
      throw error;
    }
  }

  /**
   * Pārbaudīt, vai ir pending operācijas
   */
  async hasPendingOperations(): Promise<boolean> {
    try {
      for (const queueType of Object.values(SYNC_KEYS)) {
        const queue = await this.getQueue(queueType);
        if (queue.length > 0) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking pending operations:', error);
      return false;
    }
  }

  /**
   * Destroy instance un tīrīt listeners
   */
  destroy(): void {
    if (this.networkListener) {
      this.networkListener();
      this.networkListener = null;
    }
    
    if (this.backgroundSyncInterval) {
      clearInterval(this.backgroundSyncInterval);
      this.backgroundSyncInterval = null;
    }
  }

  /**
   * Privātās utility funkcijas
   */
  private async getQueue(queueType: string): Promise<SyncOperation[]> {
    try {
      const queueData = await AsyncStorage.getItem(queueType);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  }

  private async saveQueue(queueType: string, queue: SyncOperation[]): Promise<void> {
    try {
      await AsyncStorage.setItem(queueType, JSON.stringify(queue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
      throw error;
    }
  }

  private async executeOperation(operation: SyncOperation, axiosInstance?: any): Promise<SyncResult> {
    try {
      if (!axiosInstance) {
        throw new Error('No axios instance provided for operation');
      }

      let response;
      
      switch (operation.method) {
        case 'POST':
          response = await axiosInstance.post(operation.endpoint, operation.data);
          break;
        case 'PUT':
          response = await axiosInstance.put(operation.endpoint, operation.data);
          break;
        case 'PATCH':
          response = await axiosInstance.patch(operation.endpoint, operation.data);
          break;
        case 'DELETE':
          response = await axiosInstance.delete(operation.endpoint);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${operation.method}`);
      }

      return {
        id: operation.id,
        success: true,
        response: response.data,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        id: operation.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }

  private async checkDependencies(dependencies: string[], results: SyncResult[]): Promise<boolean> {
    return dependencies.every(depId => 
      results.some(result => result.id === depId && result.success)
    );
  }

  private setupNetworkListener(): void {
    this.networkListener = NetInfo.addEventListener(state => {
      if (state.isConnected && !this.syncInProgress) {
        this.attemptSync();
      }
    });
  }

  private setupBackgroundSync(): void {
    const config = getSyncConfig();
    
    this.backgroundSyncInterval = setInterval(() => {
      this.attemptSync();
    }, config.backgroundInterval);
  }

  private async attemptSync(): Promise<void> {
    try {
      await AsyncStorage.setItem('last_sync_attempt_timestamp', Date.now().toString());
      
      const hasPending = await this.hasPendingOperations();
      if (hasPending) {
        await this.syncAll();
      }
    } catch (error) {
      console.error('Error in background sync:', error);
    }
  }
}

// Export singleton instance
export const syncManager = SyncManager.getInstance();
