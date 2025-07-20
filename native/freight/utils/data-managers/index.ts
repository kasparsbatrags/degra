/**
 * Data Managers Index
 * Provides convenient exports for all data management modules
 */

// Core utilities
export { SQLQueryBuilder } from './SQLQueryBuilder'
export { PlatformDataAdapter } from './PlatformDataAdapter'

// Specialized managers
export { TruckDataManager } from './TruckDataManager'
export { TruckObjectDataManager } from './TruckObjectDataManager'
export { TruckRouteDataManager } from './TruckRouteDataManager'
export { RoutePageDataManager } from './RoutePageDataManager'

// Main coordinator and convenience functions
export {
  offlineDataManagerRefactored,
  getRoutePages,
  downloadServerData,
  getTrucks,
  getObjects,
  getLastActiveRoute,
  getLastFinishedRoute,
  checkRoutePageExists,
  getRoutePoint,
  saveTruckRouteLocally
} from '../offlineDataManager'
