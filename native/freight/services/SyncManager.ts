// utils/syncManager.ts
import {getDatabase} from '@/utils/database'
import {isConnected} from '@/utils/networkUtils'
import { uploadLocalChanges, downloadServerChanges } from './syncActions';

export const syncAllData = async () => {
	const db = await getDatabase();
	let transactionStarted = false;

	try {
		await db.execAsync('BEGIN TRANSACTION');
		transactionStarted = true;

		// await uploadLocalChanges(db);
		await downloadServerChanges(db);

		await db.execAsync('COMMIT');
		console.log('✅ Sync complete');
	} catch (error) {
		if (transactionStarted) {
			await db.execAsync('ROLLBACK');
		}
		console.error('❌ Sync failed:', error);
	}
};
