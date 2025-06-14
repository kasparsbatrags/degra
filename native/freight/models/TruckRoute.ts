/**
 * TruckRoute model - Backend-compatible structure
 * Matches the backend truck_route table structure
 */
export interface TruckRoute {
  uid: string
  truck_route_page_uid: string
  route_date: string
  route_number?: number
  cargo_volume?: number
  out_truck_object_uid: string
  odometer_at_start: number
  out_date_time: string
  odometer_at_finish?: number
  in_truck_object_uid?: string
  in_date_time?: string
  route_length?: number
  fuel_balance_at_start?: number
  fuel_consumed?: number
  fuel_received?: number
  fuel_balance_at_finish?: number
  created_date_time?: string
  last_modified_date_time?: string
  unit_type_id?: number
  
  // Offline-only fields
  is_dirty?: number
  is_deleted?: number
  synced_at?: number
}

/**
 * TruckRoute with joined data for display purposes
 */
export interface TruckRouteWithDetails extends TruckRoute {
  // From truck_route_page
  date_from?: string
  date_to?: string
  truck_uid?: string
  
  // From truck
  registration_number?: string
  truck_maker?: string
  truck_model?: string
  
  // From truck_objects
  out_object_name?: string
  in_object_name?: string
}
