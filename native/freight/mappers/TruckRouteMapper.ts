import { TruckRouteResponseDto } from '@/dto/TruckRouteResponseDto'
import { TruckDto } from '@/dto/TruckDto'
import { UserDto } from '@/dto/UserDto'
import { TruckObjectDto } from '@/dto/TruckObjectDto'
import { TruckRoutePageDto } from '@/dto/TruckRoutePageDto'

/**
 * Raw SQL result interface for truck route queries
 */
export interface TruckRouteSqlResult {
  // Route fields
  uid: string
  routeDate: string
  routeNumber?: number
  cargoVolume?: number
  unitType?: string
  outDateTime: string
  odometerAtStart: number
  inDateTime?: string
  odometerAtFinish?: number
  routeLength?: number
  fuelBalanceAtStart?: number
  fuelConsumed?: number
  fuelReceived?: number
  fuelBalanceAtFinish?: number

  // TruckRoutePage fields
  truckRoutePageUid: string
  truckRoutePageDateFrom: string
  truckRoutePageDateTo: string
  truckRoutePageFuelBalanceAtStart?: number
  truckRoutePageFuelBalanceAtFinish?: number
  truckRoutePageTotalFuelReceivedOnRoutes?: number
  truckRoutePageTotalFuelConsumedOnRoutes?: number
  truckRoutePageFuelBalanceAtRoutesFinish?: number
  truckRoutePageOdometerAtRouteStart?: number
  truckRoutePageOdometerAtRouteFinish?: number
  truckRoutePageComputedTotalRoutesLength?: number

  // Truck fields
  truckUid: string
  truckMaker?: string
  truckModel?: string
  truckRegistrationNumber?: string
  truckFuelConsumptionNorm?: number
  truckIsDefault?: number

  // User fields
  userId: string
  userEmail?: string
  userGivenName?: string
  userFamilyName?: string

  // Out truck object fields
  outTruckObjectUid?: string
  outTruckObjectName?: string

  // In truck object fields
  inTruckObjectUid?: string
  inTruckObjectName?: string
}

/**
 * TruckRoute mapper class for transforming SQL results to DTOs
 */
export class TruckRouteMapper {
  
  /**
   * Transform SQL result to TruckRouteResponseDto
   */
  static sqlToTruckRouteDto(sqlResult: TruckRouteSqlResult): TruckRouteResponseDto {
    const truck: TruckDto = {
      uid: sqlResult.truckUid,
      truckMaker: sqlResult.truckMaker,
      truckModel: sqlResult.truckModel,
      registrationNumber: sqlResult.truckRegistrationNumber,
      fuelConsumptionNorm: sqlResult.truckFuelConsumptionNorm,
      isDefault: sqlResult.truckIsDefault
    }

    const user: UserDto = {
      id: sqlResult.userId,
      preferredUsername: undefined,
      email: sqlResult.userEmail,
      givenName: sqlResult.userGivenName,
      familyName: sqlResult.userFamilyName,
      attributes: undefined
    }

    const truckRoutePage: TruckRoutePageDto = {
      uid: sqlResult.truckRoutePageUid,
      dateFrom: sqlResult.truckRoutePageDateFrom,
      dateTo: sqlResult.truckRoutePageDateTo,
      truck: truck,
      user: user,
      fuelBalanceAtStart: sqlResult.truckRoutePageFuelBalanceAtStart ?? null,
      fuelBalanceAtFinish: sqlResult.truckRoutePageFuelBalanceAtFinish,
      totalFuelReceivedOnRoutes: sqlResult.truckRoutePageTotalFuelReceivedOnRoutes,
      totalFuelConsumedOnRoutes: sqlResult.truckRoutePageTotalFuelConsumedOnRoutes,
      fuelBalanceAtRoutesFinish: sqlResult.truckRoutePageFuelBalanceAtRoutesFinish,
      odometerAtRouteStart: sqlResult.truckRoutePageOdometerAtRouteStart,
      odometerAtRouteFinish: sqlResult.truckRoutePageOdometerAtRouteFinish,
      computedTotalRoutesLength: sqlResult.truckRoutePageComputedTotalRoutesLength
    }

    const outTruckObject: TruckObjectDto | null = sqlResult.outTruckObjectUid ? {
      uid: sqlResult.outTruckObjectUid,
      name: sqlResult.outTruckObjectName || ''
    } : null

    const inTruckObject: TruckObjectDto | null = sqlResult.inTruckObjectUid ? {
      uid: sqlResult.inTruckObjectUid,
      name: sqlResult.inTruckObjectName || ''
    } : null

    const truckRouteDto: TruckRouteResponseDto = {
      uid: sqlResult.uid,
      truckRoutePage: truckRoutePage,
      routeDate: sqlResult.routeDate,
      routeNumber: sqlResult.routeNumber,
      cargoVolume: sqlResult.cargoVolume,
      unitType: sqlResult.unitType,
      outTruckObject: outTruckObject,
      outDateTime: sqlResult.outDateTime,
      odometerAtStart: sqlResult.odometerAtStart,
      inTruckObject: inTruckObject,
      inDateTime: sqlResult.inDateTime,
      odometerAtFinish: sqlResult.odometerAtFinish,
      routeLength: sqlResult.routeLength,
      fuelBalanceAtStart: sqlResult.fuelBalanceAtStart,
      fuelConsumed: sqlResult.fuelConsumed,
      fuelReceived: sqlResult.fuelReceived,
      fuelBalanceAtFinish: sqlResult.fuelBalanceAtFinish
    }

    return truckRouteDto
  }

  /**
   * Transform multiple SQL results to TruckRouteResponseDto array
   */
  static sqlArrayToTruckRouteDtoArray(sqlResults: TruckRouteSqlResult[]): TruckRouteResponseDto[] {
    return sqlResults.map(sqlResult => this.sqlToTruckRouteDto(sqlResult))
  }
}