import { TruckObjectDto } from '@/dto/TruckObjectDto'

/**
 * Map TruckObject result to TruckObjectDto
 */
export const mapTruckObjectResultToDto = (result: any): TruckObjectDto => ({
  uid: result.uid || result.outTruckObjectUid || result.inTruckObjectUid || '',
  name: result.name || result.outTruckObjectName || result.inTruckObjectName || ''
})