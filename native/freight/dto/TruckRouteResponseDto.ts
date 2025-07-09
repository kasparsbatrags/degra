import { TruckObjectDto } from './TruckObjectDto'
import { TruckRoutePageDto } from './TruckRoutePageDto'

/**
 * TruckRouteResponseDto - Full response structure from database/API
 * This is the complete structure including all nested objects
 */
export interface TruckRouteResponseDto {
  uid: string
  truckRoutePage: TruckRoutePageDto
  routeDate: string
  routeNumber?: number
  cargoVolume?: number
  unitType?: string
  outTruckObject: TruckObjectDto | null
  outDateTime: string
  odometerAtStart: number
  inTruckObject: TruckObjectDto | null
  inDateTime?: string
  odometerAtFinish?: number
  routeLength?: number
  fuelBalanceAtStart?: number
  fuelConsumed?: number
  fuelReceived?: number
  fuelBalanceAtFinish?: number
}