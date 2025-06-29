import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { executeQuery, executeSelect, executeSelectFirst, OfflineOperation } from './database';
import { isOnline } from '../services/networkService';
import { isOfflineMode } from '../services/offlineService';
import freightAxiosInstance from '../config/freightAxios';

// Simple ID generation without crypto dependencies
function generateOfflineId(): string {
  // Use timestamp + multiple random parts for better uniqueness
  const timestamp = Date.now().toString();
  const randomPart1 = Math.random().toString(36).substr(2, 9);
  const randomPart2 = Math.random().toString(36).substr(2, 5);
  return `offline-${timestamp}-${randomPart1}-${randomPart2}`;
}

// Offline queue configuration
const QUEUE_STORAGE_KEY = 'offline_operations_queue';
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second base delay
const BATCH_SIZE = 10;

// Queue manager class
class OfflineQueueManager {
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  // Add operation to queue
  async addOperation(
    type: 'CREATE' | 'UPDATE' | 'DELETE',
    tableName: string,
    endpoint: string,
    data: any
  ): Promise<string> {
    const operationId = generateOfflineId();
    const operation: OfflineOperation = {
      id: operationId,
      type,
      table_name: tableName,
      endpoint,
      data: JSON.stringify(data),
      timestamp: Date.now(),
      retries: 0,
      status: 'pending',
      created_at: Date.now(),
      updated_at: Date.now()
    };

    try {
      if (Platform.OS === 'web') {
        // For web, use AsyncStorage as fallback
        await this.addOperationToAsyncStorage(operation);
      } else {
        // For mobile, use SQLite
        await this.addOperationToDatabase(operation);
      }

      console.log(`Added offline operation: ${type} ${tableName}`, operationId);
      
      const online = await isOnline();
      if (online) {
        this.processQueue();
      } else {
        console.log('Operation added to queue but not processed - device is offline');
      }
      
      return operationId;
    } catch (error) {
      console.error('Failed to add operation to queue:', error);
      throw error;
    }
  }

  // Add operation to SQLite database
  private async addOperationToDatabase(operation: OfflineOperation) {
    const sql = `
      INSERT INTO offline_operations 
      (id, type, table_name, endpoint, data, timestamp, retries, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await executeQuery(sql, [
      operation.id,
      operation.type,
      operation.table_name,
      operation.endpoint,
      operation.data,
      operation.timestamp,
      operation.retries,
      operation.status,
      operation.created_at,
      operation.updated_at
    ]);
  }

  // Add operation to AsyncStorage (web fallback)
  private async addOperationToAsyncStorage(operation: OfflineOperation) {
    try {
      const existingQueue = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      const queue: OfflineOperation[] = existingQueue ? JSON.parse(existingQueue) : [];
      queue.push(operation);
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to add operation to AsyncStorage:', error);
      throw error;
    }
  }

  // Get pending operations
  async getPendingOperations(): Promise<OfflineOperation[]> {
    try {
      if (Platform.OS === 'web') {
        return await this.getPendingOperationsFromAsyncStorage();
      } else {
        return await this.getPendingOperationsFromDatabase();
      }
    } catch (error) {
      console.error('Failed to get pending operations:', error);
      return [];
    }
  }

  // Get pending operations from SQLite
  private async getPendingOperationsFromDatabase(): Promise<OfflineOperation[]> {
    const sql = `
      SELECT * FROM offline_operations 
      WHERE status IN ('pending', 'failed') 
      ORDER BY timestamp ASC 
      LIMIT ?
    `;
    
    return await executeSelect(sql, [BATCH_SIZE]);
  }

  // Get pending operations from AsyncStorage
  private async getPendingOperationsFromAsyncStorage(): Promise<OfflineOperation[]> {
    try {
      const queueData = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (!queueData) return [];
      
      const queue: OfflineOperation[] = JSON.parse(queueData);
      return queue
        .filter(op => op.status === 'pending' || op.status === 'failed')
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(0, BATCH_SIZE);
    } catch (error) {
      console.error('Failed to get operations from AsyncStorage:', error);
      return [];
    }
  }

  // Process queue
  async processQueue(): Promise<void> {
    if (this.isProcessing) {
      console.log('Queue processing already in progress');
      return;
    }

    const online = await isOnline();
    if (!online) {
      console.log('Device is offline, skipping queue processing');
      return;
    }

    this.isProcessing = true;
    console.log('Starting offline queue processing');

    try {
      const pendingOperations = await this.getPendingOperations();
      
      if (pendingOperations.length === 0) {
        console.log('No pending operations to process');
        return;
      }

      console.log(`Processing ${pendingOperations.length} pending operations`);

      for (const operation of pendingOperations) {
        try {
          await this.processOperation(operation);
        } catch (error) {
          console.error(`Failed to process operation ${operation.id}:`, error);
          await this.markOperationFailed(operation, error);
        }
      }
    } catch (error) {
      console.error('Error during queue processing:', error);
    } finally {
      this.isProcessing = false;
      console.log('Finished offline queue processing');
    }
  }

  // Process single operation
  private async processOperation(operation: OfflineOperation): Promise<void> {
    console.log(`Processing operation: ${operation.type} ${operation.table_name}`, operation.id);

    // Mark as syncing
    await this.updateOperationStatus(operation.id, 'syncing');

    try {
      const data = JSON.parse(operation.data);
      let response;

      switch (operation.type) {
        case 'CREATE':
          response = await freightAxiosInstance.post(operation.endpoint, data);
          break;
        case 'UPDATE':
          response = await freightAxiosInstance.put(operation.endpoint, data);
          break;
        case 'DELETE':
          response = await freightAxiosInstance.delete(operation.endpoint);
          break;
        default:
          throw new Error(`Unknown operation type: ${operation.type}`);
      }

      // Mark as completed
      await this.markOperationCompleted(operation, response.data);
      console.log(`Successfully processed operation ${operation.id}`);

    } catch (error: any) {
      console.error(`Failed to process operation ${operation.id}:`, error);
      
      // Check if we should retry
      if (operation.retries < MAX_RETRIES) {
        await this.scheduleRetry(operation);
      } else {
        await this.markOperationFailed(operation, error);
      }
    }
  }

  // Update operation status
  private async updateOperationStatus(
    operationId: string, 
    status: 'pending' | 'syncing' | 'failed' | 'completed',
    errorMessage?: string
  ): Promise<void> {
    if (Platform.OS === 'web') {
      await this.updateOperationInAsyncStorage(operationId, { status, error_message: errorMessage });
    } else {
      const sql = `
        UPDATE offline_operations 
        SET status = ?, error_message = ?, updated_at = ?
        WHERE id = ?
      `;
      await executeQuery(sql, [status, errorMessage || null, Date.now(), operationId]);
    }
  }

  // Update operation in AsyncStorage
  private async updateOperationInAsyncStorage(operationId: string, updates: Partial<OfflineOperation>): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (!queueData) return;

      const queue: OfflineOperation[] = JSON.parse(queueData);
      const operationIndex = queue.findIndex(op => op.id === operationId);
      
      if (operationIndex !== -1) {
        queue[operationIndex] = { ...queue[operationIndex], ...updates, updated_at: Date.now() };
        await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
      }
    } catch (error) {
      console.error('Failed to update operation in AsyncStorage:', error);
    }
  }

  // Mark operation as completed
  private async markOperationCompleted(operation: OfflineOperation, responseData?: any): Promise<void> {
    if (Platform.OS === 'web') {
      // Remove from AsyncStorage queue
      await this.removeOperationFromAsyncStorage(operation.id);
    } else {
      // Mark as completed in database
      const sql = `
        UPDATE offline_operations 
        SET status = 'completed', updated_at = ?
        WHERE id = ?
      `;
      await executeQuery(sql, [Date.now(), operation.id]);
    }

    // Handle server response (e.g., update local records with server IDs)
    if (responseData && operation.type === 'CREATE') {
      await this.handleCreateResponse(operation, responseData);
    }
  }

  // Handle CREATE operation response
  private async handleCreateResponse(operation: OfflineOperation, responseData: any): Promise<void> {
    if (!responseData.id) return;

    try {
      // Update local record with server ID
      const data = JSON.parse(operation.data);
      const localId = data.id;
      const serverId = responseData.id;

      if (Platform.OS !== 'web') {
        const sql = `
          UPDATE ${operation.table_name} 
          SET server_id = ?, is_dirty = 0, synced_at = ?
          WHERE id = ?
        `;
        await executeQuery(sql, [serverId, Date.now(), localId]);
      }

      console.log(`Updated local record ${localId} with server ID ${serverId}`);
    } catch (error) {
      console.error('Failed to handle create response:', error);
    }
  }

  // Remove operation from AsyncStorage
  private async removeOperationFromAsyncStorage(operationId: string): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (!queueData) return;

      const queue: OfflineOperation[] = JSON.parse(queueData);
      const filteredQueue = queue.filter(op => op.id !== operationId);
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(filteredQueue));
    } catch (error) {
      console.error('Failed to remove operation from AsyncStorage:', error);
    }
  }

  // Schedule retry
  private async scheduleRetry(operation: OfflineOperation): Promise<void> {
    const newRetryCount = operation.retries + 1;
    const delay = RETRY_DELAY_BASE * Math.pow(2, newRetryCount); // Exponential backoff

    console.log(`Scheduling retry ${newRetryCount}/${MAX_RETRIES} for operation ${operation.id} in ${delay}ms`);

    setTimeout(async () => {
      if (Platform.OS === 'web') {
        await this.updateOperationInAsyncStorage(operation.id, {
          status: 'pending',
          retries: newRetryCount,
          error_message: undefined
        });
      } else {
        const sql = `
          UPDATE offline_operations 
          SET status = 'pending', retries = ?, error_message = NULL, updated_at = ?
          WHERE id = ?
        `;
        await executeQuery(sql, [newRetryCount, Date.now(), operation.id]);
      }

      // Try processing again, but check online status first
      const online = await isOnline();
      if (online) {
        this.processQueue();
      } else {
        console.log(`Retry for operation ${operation.id} queued but not processed - device is offline`);
      }
    }, delay);
  }

  // Mark operation as failed
  private async markOperationFailed(operation: OfflineOperation, error: any): Promise<void> {
    const errorMessage = error?.message || 'Unknown error';
    console.error(`Operation ${operation.id} failed permanently:`, errorMessage);

    await this.updateOperationStatus(operation.id, 'failed', errorMessage);
  }

  // Start automatic queue processing
  startAutoProcessing(intervalMs: number = 30000): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    this.processingInterval = setInterval(async () => {
      const online = await isOnline();
      if (online) {
        this.processQueue();
      } else {
        console.log('Auto processing skipped - device is offline');
      }
    }, intervalMs);

    console.log(`Started automatic queue processing every ${intervalMs}ms (respecting offline mode)`);
  }

  // Stop automatic queue processing
  stopAutoProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('Stopped automatic queue processing');
    }
  }

  // Get queue statistics
  async getQueueStats(): Promise<{
    pending: number;
    failed: number;
    completed: number;
    total: number;
  }> {
    try {
      if (Platform.OS === 'web') {
        const queueData = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
        if (!queueData) return { pending: 0, failed: 0, completed: 0, total: 0 };

        const queue: OfflineOperation[] = JSON.parse(queueData);
        return {
          pending: queue.filter(op => op.status === 'pending').length,
          failed: queue.filter(op => op.status === 'failed').length,
          completed: queue.filter(op => op.status === 'completed').length,
          total: queue.length
        };
      } else {
        const stats = await executeSelectFirst(`
          SELECT 
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
            COUNT(*) as total
          FROM offline_operations
        `);

        return {
          pending: stats?.pending || 0,
          failed: stats?.failed || 0,
          completed: stats?.completed || 0,
          total: stats?.total || 0
        };
      }
    } catch (error) {
      console.error('Failed to get queue stats:', error);
      return { pending: 0, failed: 0, completed: 0, total: 0 };
    }
  }

  // Clear completed operations
  async clearCompletedOperations(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        const queueData = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
        if (!queueData) return;

        const queue: OfflineOperation[] = JSON.parse(queueData);
        const activeQueue = queue.filter(op => op.status !== 'completed');
        await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(activeQueue));
      } else {
        await executeQuery('DELETE FROM offline_operations WHERE status = ?', ['completed']);
      }

      console.log('Cleared completed operations from queue');
    } catch (error) {
      console.error('Failed to clear completed operations:', error);
    }
  }
}

// Export singleton instance
export const offlineQueue = new OfflineQueueManager();

// Convenience functions
export const addOfflineOperation = (
  type: 'CREATE' | 'UPDATE' | 'DELETE',
  tableName: string,
  endpoint: string,
  data: any
): Promise<string> => {
  return offlineQueue.addOperation(type, tableName, endpoint, data);
};

export const processOfflineQueue = (): Promise<void> => {
  return offlineQueue.processQueue();
};

export const getOfflineQueueStats = () => {
  return offlineQueue.getQueueStats();
};

export const startOfflineQueueProcessing = (intervalMs?: number) => {
  offlineQueue.startAutoProcessing(intervalMs);
};

export const stopOfflineQueueProcessing = () => {
  offlineQueue.stopAutoProcessing();
};
