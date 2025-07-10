import { TruckDto } from '@/dto/TruckDto'
import { Truck } from '@/models/Truck'

/**
 * Map database result to TruckDto
 * Handles conversion from snake_case database fields to camelCase DTO fields
 */
export const mapTruckResultToDto = (result: any): TruckDto => {
  return {
    uid: result.uid || '',
    truckMaker: result.truck_maker || '',
    truckModel: result.truck_model || '',
    registrationNumber: result.registration_number || '',
    fuelConsumptionNorm: result.fuel_consumption_norm || 0,
    isDefault: result.is_default || 0
  }
}

/**
 * Map array of database results to TruckDto array
 * Synchronous version for multiple trucks
 */
export const mapTruckResultsToDto = (results: any[]): TruckDto[] => {
  if (!Array.isArray(results)) {
    return []
  }

  return results
    .filter(result => result && result.uid) // Filter out invalid entries
    .map(result => mapTruckResultToDto(result))
}

/**
 * Map TruckDto to database model
 * Both DTO and model use camelCase fields
 */
export const mapTruckDtoToModel = (truckDto: TruckDto): Truck => {
  return {
    uid: truckDto.uid || '',
    truckMaker: truckDto.truckMaker || '',
    truckModel: truckDto.truckModel || '',
    registrationNumber: truckDto.registrationNumber || '',
    fuelConsumptionNorm: truckDto.fuelConsumptionNorm || 0,
    isDefault: Boolean(truckDto.isDefault),
    is_dirty: 1,
    is_deleted: 0,
    created_at: Date.now(),
    updated_at: Date.now()
  }
}

/**
 * Map array of TruckDto to database models
 */
export const mapTruckDtosToModels = (truckDtos: TruckDto[]): Truck[] => {
  if (!Array.isArray(truckDtos)) {
    return []
  }

  return truckDtos
    .filter(dto => dto && dto.uid) // Filter out invalid entries
    .map(dto => mapTruckDtoToModel(dto))
}

/**
 * Map server response to TruckDto
 * Handles server data that might already be in camelCase
 */
export const mapServerResponseToTruckDto = (serverData: any): TruckDto => {
  return {
    uid: serverData.uid || '',
    truckMaker: serverData.truckMaker || '',
    truckModel: serverData.truckModel || '',
    registrationNumber: serverData.registrationNumber || '',
    fuelConsumptionNorm: serverData.fuelConsumptionNorm || 0,
    isDefault: serverData.isDefault || 0
  }
}

/**
 * Map array of server responses to TruckDto array
 */
export const mapServerResponseToTruckDtos = (serverData: any[]): TruckDto[] => {
  if (!Array.isArray(serverData)) {
    return []
  }

  return serverData
    .filter(data => data && data.uid) // Filter out invalid entries
    .map(data => mapServerResponseToTruckDto(data))
}