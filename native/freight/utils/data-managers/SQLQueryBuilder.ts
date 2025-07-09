/**
 * Centralized SQL query builder for offline data management
 * Contains all SQL queries used across different data managers
 */
export class SQLQueryBuilder {
  
  // Truck related queries
  static getInsertTruckSQL(): string {
    return `
      INSERT OR REPLACE INTO truck
      (uid, truck_maker, truck_model, registration_number, fuel_consumption_norm, is_default, is_dirty, is_deleted, synced_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?)
    `
  }

  static getSelectTrucksSQL(): string {
    return `
      SELECT *
      FROM truck
      WHERE is_deleted = 0
      ORDER BY registration_number ASC
    `
  }

  static getSelectTruckByIdSQL(): string {
    return `
      SELECT *
      FROM truck
      WHERE uid = ? AND is_deleted = 0
    `
  }

  // Truck Object related queries
  static getInsertObjectSQL(): string {
    return `
      INSERT OR REPLACE INTO truck_object
      (uid, name, is_dirty, is_deleted, synced_at)
      VALUES (?, ?, 0, 0, ?)
    `
  }

  static getSelectObjectsSQL(): string {
    return `
      SELECT *
      FROM truck_object
      WHERE is_deleted = 0
      ORDER BY name ASC
    `
  }

  // Truck Route related queries
  static getInsertTruckRouteSQL(): string {
    return `
      INSERT OR REPLACE INTO truck_route
      (uid, truck_route_page_uid, route_date, route_number, cargo_volume,
       out_truck_object_uid, odometer_at_start, out_date_time,
       odometer_at_finish, in_truck_object_uid, in_date_time,
       route_length, fuel_balance_at_start, fuel_consumed,
       fuel_received, fuel_balance_at_finish, created_date_time,
       last_modified_date_time, unit_type_id, is_dirty, is_deleted, synced_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
    `
  }

  static getSelectTruckRoutesSQL(): string {
    return `
      SELECT tr.*,
             trp.date_from,
             trp.date_to,
             trp.truck_uid,
             t.registration_number,
             t.truck_maker,
             t.truck_model,
             out_obj.name as out_object_name,
             in_obj.name  as in_object_name
      FROM truck_route tr
               LEFT JOIN truck_route_page trp ON tr.truck_route_page_uid = trp.uid
               LEFT JOIN truck t ON trp.truck_uid = t.uid
               LEFT JOIN truck_object out_obj ON tr.out_truck_object_uid = out_obj.uid
               LEFT JOIN truck_object in_obj ON tr.in_truck_object_uid = in_obj.uid
      WHERE tr.is_deleted = 0
    `
  }

  static getSelectLastActiveRouteSQL(): string {
    return `
      SELECT tr.uid as uid,
             tr.route_date as routeDate,
             tr.route_number as routeNumber,
             tr.cargo_volume as cargoVolume,
             tr.unit_type_id as unitType,
             tr.out_date_time as outDateTime,
             tr.odometer_at_start as odometerAtStart,
             tr.in_date_time as inDateTime,
             tr.odometer_at_finish as odometerAtFinish,
             tr.route_length as routeLength,
             tr.fuel_balance_at_start as fuelBalanceAtStart,
             tr.fuel_consumed as fuelConsumed,
             tr.fuel_received as fuelReceived,
             tr.fuel_balance_at_finish as fuelBalanceAtFinish,
             
             -- TruckRoutePage data
             trp.uid as truckRoutePageUid,
             trp.date_from as truckRoutePageDateFrom,
             trp.date_to as truckRoutePageDateTo,
             trp.fuel_balance_at_start as truckRoutePageFuelBalanceAtStart,
             trp.fuel_balance_at_end as truckRoutePageFuelBalanceAtFinish,
             trp.total_fuel_received_on_routes as truckRoutePageTotalFuelReceivedOnRoutes,
             trp.total_fuel_consumed_on_routes as truckRoutePageTotalFuelConsumedOnRoutes,
             trp.fuel_balance_at_routes_finish as truckRoutePageFuelBalanceAtRoutesFinish,
             trp.odometer_at_route_start as truckRoutePageOdometerAtRouteStart,
             trp.odometer_at_route_finish as truckRoutePageOdometerAtRouteFinish,
             trp.computed_total_routes_length as truckRoutePageComputedTotalRoutesLength,
             
             -- Truck data
             t.uid as truckUid,
             t.truck_maker as truckMaker,
             t.truck_model as truckModel,
             t.registration_number as truckRegistrationNumber,
             t.fuel_consumption_norm as truckFuelConsumptionNorm,
             t.is_default as truckIsDefault,
             
             -- User data
             trp.user_id as userId,
             u.email as userEmail,
             u.given_name as userGivenName,
             u.family_name as userFamilyName,
             
             -- Out truck object
             out_obj.uid as outTruckObjectUid,
             out_obj.name as outTruckObjectName,
             
             -- In truck object
             in_obj.uid as inTruckObjectUid,
             in_obj.name as inTruckObjectName

      FROM truck_route tr
               LEFT JOIN truck_route_page trp ON tr.truck_route_page_uid = trp.uid
               LEFT JOIN truck t ON t.uid = trp.truck_uid
               LEFT JOIN user u ON trp.user_id = u.id
               LEFT JOIN truck_object out_obj ON tr.out_truck_object_uid = out_obj.uid
               LEFT JOIN truck_object in_obj ON tr.in_truck_object_uid = in_obj.uid
      WHERE tr.in_date_time IS NULL
        AND tr.is_deleted = 0
      ORDER BY tr.out_date_time DESC
      LIMIT 1
    `
  }

  static getSelectLastFinishedRouteSQL(): string {
    return `
      SELECT tr.uid as uid,
             tr.route_date as routeDate,
             tr.route_number as routeNumber,
             tr.cargo_volume as cargoVolume,
             tr.unit_type_id as unitType,
             tr.out_date_time as outDateTime,
             tr.odometer_at_start as odometerAtStart,
             tr.in_date_time as inDateTime,
             tr.odometer_at_finish as odometerAtFinish,
             tr.route_length as routeLength,
             tr.fuel_balance_at_start as fuelBalanceAtStart,
             tr.fuel_consumed as fuelConsumed,
             tr.fuel_received as fuelReceived,
             tr.fuel_balance_at_finish as fuelBalanceAtFinish,
             
             -- TruckRoutePage data
             trp.uid as truckRoutePageUid,
             trp.date_from as truckRoutePageDateFrom,
             trp.date_to as truckRoutePageDateTo,
             trp.fuel_balance_at_start as truckRoutePageFuelBalanceAtStart,
             trp.fuel_balance_at_end as truckRoutePageFuelBalanceAtFinish,
             trp.total_fuel_received_on_routes as truckRoutePageTotalFuelReceivedOnRoutes,
             trp.total_fuel_consumed_on_routes as truckRoutePageTotalFuelConsumedOnRoutes,
             trp.fuel_balance_at_routes_finish as truckRoutePageFuelBalanceAtRoutesFinish,
             trp.odometer_at_route_start as truckRoutePageOdometerAtRouteStart,
             trp.odometer_at_route_finish as truckRoutePageOdometerAtRouteFinish,
             trp.computed_total_routes_length as truckRoutePageComputedTotalRoutesLength,
             
             -- Truck data
             t.uid as truckUid,
             t.truck_maker as truckMaker,
             t.truck_model as truckModel,
             t.registration_number as truckRegistrationNumber,
             t.fuel_consumption_norm as truckFuelConsumptionNorm,
             t.is_default as truckIsDefault,
             
             -- User data
             trp.user_id as userId,
             
             -- Out truck object
             out_obj.uid as outTruckObjectUid,
             out_obj.name as outTruckObjectName,
             
             -- In truck object
             in_obj.uid as inTruckObjectUid,
             in_obj.name as inTruckObjectName

      FROM truck_route tr
               LEFT JOIN truck_route_page trp ON tr.truck_route_page_uid = trp.uid
               LEFT JOIN truck t ON t.uid = trp.truck_uid
               LEFT JOIN truck_object out_obj ON tr.out_truck_object_uid = out_obj.uid
               LEFT JOIN truck_object in_obj ON tr.in_truck_object_uid = in_obj.uid
      WHERE tr.in_date_time IS NOT NULL
        AND tr.is_deleted = 0
      ORDER BY tr.in_date_time DESC
      LIMIT 1
    `
  }

  static getUpdateTruckRouteEndSQL(): string {
    return `
      UPDATE truck_route
      SET
          in_truck_object_uid = ?,
          odometer_at_finish = ?,
          in_date_time = ?,
          route_length = ?,
          fuel_balance_at_finish = ?,
          is_dirty = 1
      WHERE uid = ?
    `
  }

  // Route Page related queries
  static getInsertRoutePageSQL(): string {
    return `
      INSERT OR REPLACE INTO truck_route_page
      (uid, date_from, date_to, truck_uid, user_id, fuel_balance_at_start, fuel_balance_at_end,
       total_fuel_received_on_routes, total_fuel_consumed_on_routes, fuel_balance_at_routes_finish,
       odometer_at_route_start, odometer_at_route_finish, computed_total_routes_length,
       is_dirty, is_deleted, synced_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
    `
  }

  static getUpdateRoutePageSQL(): string {
    return `
      UPDATE truck_route_page 
      SET date_from = ?, date_to = ?, truck_uid = ?, 
          fuel_balance_at_start = ?, fuel_balance_at_end = ?,
          total_fuel_received_on_routes = ?, total_fuel_consumed_on_routes = ?,
          fuel_balance_at_routes_finish = ?, odometer_at_route_start = ?,
          odometer_at_route_finish = ?, computed_total_routes_length = ?,
          is_dirty = 1, updated_at = ?
      WHERE uid = ?
    `
  }

  static getSelectRoutePagesSQL(): string {
    return `
      SELECT trp.*,
             t.truck_maker,
             t.truck_model,
             t.registration_number,
             t.fuel_consumption_norm,
             t.is_default,
             u.email,
             u.given_name,
             u.family_name
      FROM truck_route_page trp
               LEFT JOIN truck t ON trp.truck_uid = t.uid
               LEFT JOIN user u ON trp.user_id = u.id
      WHERE trp.is_deleted = 0
      ORDER BY trp.date_from DESC
    `
  }

  static getCheckRoutePageExistsSQL(): string {
    return `
      SELECT trp.*,
             t.truck_maker,
             t.truck_model,
             t.registration_number,
             t.fuel_consumption_norm,
             t.is_default,
             u.email,
             u.given_name,
             u.family_name
      FROM truck_route_page trp
               LEFT JOIN truck t ON trp.truck_uid = t.uid
               LEFT JOIN user u ON trp.user_id = u.id
      WHERE trp.truck_uid = ?
        AND date(trp.date_from) <= date(?)
        AND date(trp.date_to) >= date(?)
        AND trp.is_deleted = 0
      LIMIT 1
    `
  }

  // Cleanup queries
  static getDeleteSyncedTrucksSQL(): string {
    return 'DELETE FROM truck WHERE synced_at IS NOT NULL AND is_dirty = 0'
  }

  static getDeleteSyncedObjectsSQL(): string {
    return 'DELETE FROM truck_object WHERE synced_at IS NOT NULL AND is_dirty = 0'
  }

  static getDeleteSyncedTruckRoutesSQL(): string {
    return 'DELETE FROM truck_route WHERE synced_at IS NOT NULL AND is_dirty = 0'
  }

  static getDeleteSyncedRoutePagesSQL(): string {
    return 'DELETE FROM truck_route_page WHERE synced_at IS NOT NULL AND is_dirty = 0'
  }
}
