/**
 * Offline data management utilities
 * Handles local saving of truck routes and related data
 * Maintains backward compatibility with existing imports
 */

import uuid from 'react-native-uuid';
import { TruckRouteDataManager } from './data-managers/TruckRouteDataManager';
import { RoutePageDataManager } from './data-managers/RoutePageDataManager';
import { TruckRouteDto } from '@/dto/TruckRouteDto';
import { TruckRoutePageDto } from '@/dto/TruckRoutePageDto';
import { TruckDto } from '@/dto/TruckDto';
import { offlineDataManagerRefactored } from './offlineDataManagerRefactored';

const truckRouteDataManager = new TruckRouteDataManager();
const routePageDataManager = new RoutePageDataManager();

export async function saveTruckRouteLocally(
    type: 'startRoute' | 'endRoute',
    routeData: TruckRouteDto
): Promise<string> {
    // Ensure UID exists
    if (!routeData.uid) {
        routeData.uid = uuid.v4().toString();
    }
    
    try {
        // Create mock saveTruckRoutePage function that handles route page locally
        const saveTruckRoutePage = async (routePage: any): Promise<string> => {
            if (!routePage) {
                throw new Error('Route page is required');
            }
            
            if (!routePage.uid) {
                routePage.uid = uuid.v4().toString();
            }
            
            // Save route page locally using existing data manager
            await routePageDataManager.saveRoutePageToDatabase(routePage);
            return routePage.uid;
        };
        
        // Save using existing data manager
        const savedUid = await truckRouteDataManager.saveTruckRoute(
            type,
            routeData,
            saveTruckRoutePage
        );
        
        console.log(`💾 Saved ${type} locally with UID: ${savedUid}`);
        return savedUid;
    } catch (error) {
        console.error(`❌ Failed to save ${type} locally:`, error);
        throw error;
    }
}

export async function updateTruckRouteLocally(
    routeData: TruckRouteDto
): Promise<void> {
    if (!routeData.uid) {
        throw new Error('UID is required for updating truck route');
    }
    
    try {
        await saveTruckRouteLocally('endRoute', routeData);
        console.log(`💾 Updated truck route locally: ${routeData.uid}`);
    } catch (error) {
        console.error(`❌ Failed to update truck route locally:`, error);
        throw error;
    }
}

// Export functions for backward compatibility with index.tsx imports
export const downloadServerData = () => offlineDataManagerRefactored.syncAllData();
export const getRoutePages = () => offlineDataManagerRefactored.getRoutePages();
export const getTrucks = (): Promise<TruckDto[]> => offlineDataManagerRefactored.getTrucks();
export const getObjects = () => offlineDataManagerRefactored.getObjects();
export const getLastActiveRoute = () => offlineDataManagerRefactored.getLastActiveRoute();
export const getLastFinishedRoute = () => offlineDataManagerRefactored.getLastFinishedRoute();
export const checkRoutePageExists = (truckId: string, date: string): Promise<TruckRoutePageDto | null> => offlineDataManagerRefactored.checkRoutePageExists(truckId, date);
export const getRoutePoint = () => offlineDataManagerRefactored.getRoutePoint();

// Export the main offline data manager instance
export const offlineDataManager = offlineDataManagerRefactored;
