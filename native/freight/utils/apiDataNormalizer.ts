/**
 * API Data Normalizer
 *
 * Centralizes the transformation of API responses to application/database format.
 * Handles nested objects, missing fields, and ensures data consistency.
 */

import {RoutePage} from './database'

// Type for raw API response (as received from server)
interface RawApiRoutePage {
	uid?: string;
	dateFrom?: string;
	dateTo?: string;
	user?: {
		id?: number;
	};
	truck?: {
		uid?: string; registrationNumber?: string; model?: string;
	};
	fuelConsumptionNorm?: number;
	fuelBalanceAtStart?: number;
	totalFuelReceivedOnRoutes?: number | null;
	totalFuelConsumedOnRoutes?: number | null;
	fuelBalanceAtRoutesFinish?: number | null;
	odometerAtRouteStart?: number | null;
	odometerAtRouteFinish?: number | null;
	computedTotalRoutesLength?: number | null;
	truck_route_server_id?: number;
	// Add other possible API fields here
}

/**
 * Normalizes a route page from API format to application format
 */
export const normalizeRoutePageFromApi = (apiData: RawApiRoutePage): RoutePage | null => {
	try {
		// Validate required fields
		if (!apiData.dateFrom || !apiData.dateTo) {
			console.warn('🔄 [NORMALIZER] Skipping route page - missing required date fields:', apiData)
			return null
		}

		// Extract truck registration number from nested object or direct field
		const truckRegistrationNumber = apiData.truck?.registrationNumber || (apiData as any).truck_registration_number || (apiData as any).truckRegistrationNumber

		if (!truckRegistrationNumber) {
			console.warn('🔄 [NORMALIZER] Skipping route page - missing truck registration number:', apiData)
			return null
		}

		// Extract fuel consumption norm
		const fuelConsumptionNorm = apiData.fuelConsumptionNorm || (apiData as any).fuel_consumption_norm || 0

		if (fuelConsumptionNorm <= 0) {
			console.warn('🔄 [NORMALIZER] Skipping route page - invalid fuel consumption norm:', apiData)
			return null
		}

		// Extract fuel balance at start
		const fuelBalanceAtStart = apiData.fuelBalanceAtStart || (apiData as any).fuel_balance_at_start || 0

		// Create normalized object
		const normalized: RoutePage = {
			uid: apiData.uid,
			truck_uid: apiData.truck?.uid,
			date_from: apiData.dateFrom,
			date_to: apiData.dateTo,
			truck_registration_number: truckRegistrationNumber,
			fuel_consumption_norm: fuelConsumptionNorm,
			fuel_balance_at_start: fuelBalanceAtStart,
			total_fuel_received_on_routes: apiData.totalFuelReceivedOnRoutes ?? (apiData as any).total_fuel_received_on_routes ?? undefined,
			total_fuel_consumed_on_routes: apiData.totalFuelConsumedOnRoutes ?? (apiData as any).total_fuel_consumed_on_routes ?? undefined,
			fuel_balance_at_routes_finish: apiData.fuelBalanceAtRoutesFinish ?? (apiData as any).fuel_balance_at_routes_finish ?? undefined,
			odometer_at_route_start: apiData.odometerAtRouteStart ?? (apiData as any).odometer_at_route_start ?? undefined,
			odometer_at_route_finish: apiData.odometerAtRouteFinish ?? (apiData as any).odometer_at_route_finish ?? undefined,
			computed_total_routes_length: apiData.computedTotalRoutesLength ?? (apiData as any).computed_total_routes_length ?? undefined,
			is_dirty: 0,
			is_deleted: 0,
			created_at: Date.now(),
			updated_at: Date.now(),
			synced_at: Date.now()
		}

		console.log('🔄 [NORMALIZER] Successfully normalized route page:', {
			id: normalized.id, truck: normalized.truck_registration_number, dateFrom: normalized.date_from, dateTo: normalized.date_to
		})

		return normalized

	} catch (error) {
		console.error('🔄 [NORMALIZER] Error normalizing route page:', error, 'Data:', apiData)
		return null
	}
}

/**
 * Normalizes an array of route pages from API format
 */
export const normalizeRoutePagesFromApi = (apiDataArray: RawApiRoutePage[]): RoutePage[] => {
	if (!Array.isArray(apiDataArray)) {
		console.warn('🔄 [NORMALIZER] Expected array but got:', typeof apiDataArray)
		return []
	}

	const normalized: RoutePage[] = []
	let skippedCount = 0

	for (const apiData of apiDataArray) {
		const normalizedPage = normalizeRoutePageFromApi(apiData)
		if (normalizedPage) {
			normalized.push(normalizedPage)
		} else {
			skippedCount++
		}
	}

	console.log(`🔄 [NORMALIZER] Processed ${apiDataArray.length} route pages: ${normalized.length} normalized, ${skippedCount} skipped`)

	return normalized
}

/**
 * Validates that a route page has all required fields for database insertion
 */
export const validateRoutePageForDb = (routePage: RoutePage): boolean => {
	const requiredFields = ['date_from', 'date_to', 'truck_registration_number', 'fuel_consumption_norm', 'fuel_balance_at_start']

	for (const field of requiredFields) {
		const value = (routePage as any)[field]
		if (value === null || value === undefined || value === '') {
			console.warn(`🔄 [VALIDATOR] Route page missing required field '${field}':`, routePage)
			return false
		}
	}

	return true
}

// Export types for use in other files
export type {RawApiRoutePage}
