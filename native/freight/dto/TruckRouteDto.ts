import { TruckDto } from './TruckDto'
import { TruckObjectDto } from './TruckObjectDto'
import { TruckRoutePageDto } from './TruckRoutePageDto'

/**
 * TruckRoute DTO - Matches server response structure
 * This is the structure returned by the backend API
 */
export interface TruckRouteDto {
  uid: string
  truckRoutePage: TruckRoutePageDto
  routeDate: string
  routeNumber?: number
  cargoVolume?: number
  unitType?: string
  outTruckObject: TruckObjectDto
  outDateTime: string
  odometerAtStart: number
  inTruckObject?: TruckObjectDto
  inDateTime?: string
  odometerAtFinish?: number
  routeLength?: number
  fuelBalanceAtStart?: number
  fuelConsumed?: number
  fuelReceived?: number
  fuelBalanceAtFinish?: number
}

/**
 * Simplified TruckRoute DTO for API requests
 */
export interface CreateTruckRouteDto {
  truckRoutePageUid: string
  routeDate: string
  routeNumber?: number
  cargoVolume?: number
  unitTypeId?: number
  outTruckObjectUid: string
  outDateTime: string
  odometerAtStart: number
  inTruckObjectUid?: string
  inDateTime?: string
  odometerAtFinish?: number
  routeLength?: number
  fuelBalanceAtStart?: number
  fuelConsumed?: number
  fuelReceived?: number
  fuelBalanceAtFinish?: number
}

/**
 * Update TruckRoute DTO for API requests
 */
export interface UpdateTruckRouteDto extends Partial<CreateTruckRouteDto> {
  uid: string
}
