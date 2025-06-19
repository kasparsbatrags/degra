import { useEffect, useState } from 'react';
import { isOfflineMode } from '../services/offlineService';
import { isConnected } from '../utils/networkUtils';

/**
 * Apraksta iespējamos tīkla statusa stāvokļus.
 */
export type NetworkStatus = 'online' | 'offline' | 'forced-offline';

/**
 * Hook, kas atgriež tīkla statusu un citu saistīto informāciju.
 */
export function useNetworkStatus() {
	const [status, setStatus] = useState<NetworkStatus>('offline');

	const pendingOperations = 0;
	const cacheSize = 0;

	useEffect(() => {
		let mounted = true;

		const checkStatus = async () => {
			const connected = await isConnected();
			const offline = await isOfflineMode();

			if (!mounted) return;

			if (offline) {
				setStatus('forced-offline');
			} else if (connected) {
				setStatus('online');
			} else {
				setStatus('offline');
			}
		};

		checkStatus();
		const interval = setInterval(checkStatus, 5000);

		return () => {
			mounted = false;
			clearInterval(interval);
		};
	}, []);

	return {
		status, // 'online' | 'offline' | 'forced-offline'
		isOnline: status === 'online',
		isOfflineMode: status === 'forced-offline',
		pendingOperations,
		cacheSize,
	};
}

type SyncStatus = {
	isSyncing: boolean;
	hasPendingData: boolean;
	lastSyncFormatted: string;
	performSync: () => void;
	canSync: boolean;
};

/**
 * Hook sinhronizācijas statusam (placeholder, paplašināms).
 */
export function useSyncStatus(): SyncStatus {
	return {
		isSyncing: false,
		hasPendingData: false,
		lastSyncFormatted: '',
		performSync: () => {},
		canSync: false,
	};
}
