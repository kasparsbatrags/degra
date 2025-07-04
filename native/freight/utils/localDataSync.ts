/**
 * Local data synchronization utilities
 * Manages sync status of local SQLite records
 */

import { executeQuery, executeSelect } from './database';

export async function markLocalRecordAsSynced(uid: string): Promise<void> {
    try {
        const sql = `
            UPDATE truck_routes 
            SET is_dirty = 0,
                synced_at = ?
            WHERE uid = ?
        `;
        
        await executeQuery(sql, [Date.now(), uid]);
        console.log(`✅ Record ${uid} marked as synced`);
    } catch (error) {
        console.error('❌ Failed to mark record as synced:', error);
        throw error;
    }
}

export async function markLocalRecordAsDirty(uid: string): Promise<void> {
    try {
        const sql = `
            UPDATE truck_routes 
            SET is_dirty = 1
            WHERE uid = ?
        `;
        
        await executeQuery(sql, [uid]);
        console.log(`🔄 Record ${uid} marked as dirty`);
    } catch (error) {
        console.error('❌ Failed to mark record as dirty:', error);
        throw error;
    }
}

export async function getUnsyncedRecords(): Promise<any[]> {
    try {
        const sql = `
            SELECT * FROM truck_routes 
            WHERE is_dirty = 1 AND is_deleted = 0
            ORDER BY created_at ASC
        `;
        
        const result = await executeSelect(sql);
        return result || [];
    } catch (error) {
        console.error('❌ Failed to get unsynced records:', error);
        return [];
    }
}

export async function getRecordSyncStatus(uid: string): Promise<{
    is_dirty: boolean;
    synced_at: number | null;
    exists: boolean;
}> {
    try {
        const sql = `
            SELECT is_dirty, synced_at 
            FROM truck_routes 
            WHERE uid = ? AND is_deleted = 0
        `;
        
        const result = await executeSelect(sql, [uid]);
        
        if (result && result.length > 0) {
            const record = result[0];
            return {
                is_dirty: Boolean(record.is_dirty),
                synced_at: record.synced_at,
                exists: true
            };
        }
        
        return {
            is_dirty: false,
            synced_at: null,
            exists: false
        };
    } catch (error) {
        console.error('❌ Failed to get record sync status:', error);
        return {
            is_dirty: false,
            synced_at: null,
            exists: false
        };
    }
}