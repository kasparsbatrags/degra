// utils/syncActions.ts
import { getDatabase } from '@/database';
import { freightAxiosInstance } from '@/config/freightAxios';
import { Truck, TruckObject, TruckRoutePage } from '@/database';

/**
 * Upload all locally changed entities to the server
 */
export const uploadLocalChanges = async () => {
	const db = await getDatabase();
	console.log('⬆️ Uploading local changes to server...');

	const tables = ['truck', 'truck_object', 'truck_route_page'];

	for (const table of tables) {
		const rows = await db.getAllAsync(`SELECT * FROM ${table} WHERE is_dirty = 1 OR is_deleted = 1`);
		if (rows.length === 0) continue;

		console.log(`⬆️ Uploading ${rows.length} changes from table ${table}`);

		try {
			await freightAxiosInstance.post(`/sync/${table}`, rows);
			const ids = rows.map((r: any) => `'${r.uid}'`).join(', ');
			await db.runAsync(`UPDATE ${table} SET is_dirty = 0, is_deleted = 0, synced_at = strftime('%s','now') WHERE uid IN (${ids})`);
		} catch (err) {
			console.error(`❌ Failed to upload data for ${table}:`, err);
		}
	}
};

/**
 * Download fresh data from server and store it locally
 */
export const downloadServerChanges = async () => {
	const db = await getDatabase();
	console.log('⬇️ Downloading server data to local DB...');

	const endpoints = [
		{ name: 'truck', table: 'truck' },
		{ name: 'truck-object', table: 'truck_object' },
		{ name: 'truck-route-page', table: 'truck_route_page' }
	];

	for (const { name, table } of endpoints) {
		try {
			const response = await freightAxiosInstance.get(`/sync/${name}`);
			const items = response.data;

			console.log(`⬇️ Received ${items.length} items for ${table}`);

			await db.withTransactionAsync(async () => {
				for (const item of items) {
					await db.runAsync(
							`INSERT OR REPLACE INTO ${table} (uid, is_dirty, is_deleted, synced_at, created_at, updated_at, ...) VALUES (?, 0, 0, ?, ?, ?, ...)`,
							[item.uid, Date.now(), Date.now(), Date.now() /* + other values */]
					);
				}
			});
		} catch (err) {
			console.error(`❌ Failed to download data for ${table}:`, err);
		}
	}
};
