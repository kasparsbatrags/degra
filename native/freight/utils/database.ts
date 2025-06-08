import { Platform } from 'react-native';

// Database configuration
const DATABASE_NAME = 'freight_offline.db';
const DATABASE_VERSION = 1;

// Dynamic SQLite loading to avoid web errors
let SQLite: any = null;
let db: any = null;

// Load SQLite only on mobile platforms
const getSQLite = () => {
  if (Platform.OS === 'web') {
    return null;
  }
  
  if (!SQLite) {
    try {
      SQLite = require('expo-sqlite');
    } catch (error) {
      console.error('Failed to load expo-sqlite:', error);
      return null;
    }
  }
  
  return SQLite;
};

// Initialize database
export const initDatabase = async (): Promise<any> => {
  if (db) {
    return db;
  }

  try {
    if (Platform.OS === 'web') {
      // For web, SQLite is not supported - return null to indicate web mode
      console.warn('SQLite not supported on web platform - using AsyncStorage fallback');
      return null;
    }

    const sqlite = getSQLite();
    if (!sqlite) {
      throw new Error('SQLite not available');
    }

    db = await sqlite.openDatabaseAsync(DATABASE_NAME);
    
    // Enable foreign keys
    await db.execAsync('PRAGMA foreign_keys = ON;');
    
    // Create tables
    await createTables(db);
    
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Create database tables - Backend-compatible structure
const createTables = async (database: any) => {
  const createTablesSQL = `
    -- Offline operations queue
    CREATE TABLE IF NOT EXISTS offline_operations (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK (type IN ('CREATE', 'UPDATE', 'DELETE')),
      table_name TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      data TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      retries INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'syncing', 'failed', 'completed')),
      error_message TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    -- Truck Route Pages (backend-compatible structure)
    CREATE TABLE IF NOT EXISTS truck_route_page (
      uid TEXT PRIMARY KEY,
      date_from TEXT NOT NULL,
      date_to TEXT,
      truck_uid TEXT NOT NULL,
      user_id TEXT,
      fuel_balance_at_start REAL NOT NULL,
      fuel_balance_at_end REAL NOT NULL,
      
      -- Computed fields (from backend @Transient)
      total_fuel_received_on_routes REAL,
      total_fuel_consumed_on_routes REAL,
      fuel_balance_at_routes_finish REAL,
      odometer_at_route_start INTEGER,
      odometer_at_route_finish INTEGER,
      computed_total_routes_length INTEGER,
      
      -- Offline-only fields
      is_dirty INTEGER DEFAULT 0,
      is_deleted INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      synced_at INTEGER
    );

    -- Trucks (backend-compatible structure)
    CREATE TABLE IF NOT EXISTS truck (
      uid TEXT PRIMARY KEY,
      truck_maker TEXT NOT NULL,
      truck_model TEXT NOT NULL,
      registration_number TEXT NOT NULL,
      fuel_consumption_norm REAL NOT NULL,
      
      -- Offline-only fields
      is_dirty INTEGER DEFAULT 0,
      is_deleted INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      synced_at INTEGER
    );

    -- Truck Objects (backend-compatible structure)
    CREATE TABLE IF NOT EXISTS truck_object (
      uid TEXT PRIMARY KEY,
      name TEXT,
      
      -- Offline-only fields
      is_dirty INTEGER DEFAULT 0,
      is_deleted INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      synced_at INTEGER
    );

    -- Truck routes
    CREATE TABLE IF NOT EXISTS truck_routes (
      id INTEGER PRIMARY KEY,
      server_id INTEGER UNIQUE,
      date_from TEXT NOT NULL,
      date_to TEXT NOT NULL,
      truck_registration_number TEXT NOT NULL,
      fuel_consumption_norm REAL NOT NULL,
      fuel_balance_at_start REAL NOT NULL,
      total_fuel_received_on_routes REAL,
      total_fuel_consumed_on_routes REAL,
      fuel_balance_at_routes_finish REAL,
      odometer_at_route_start INTEGER,
      odometer_at_route_finish INTEGER,
      computed_total_routes_length INTEGER,
      is_dirty INTEGER DEFAULT 0,
      is_deleted INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      synced_at INTEGER
    );

    -- Fuel entries
    CREATE TABLE IF NOT EXISTS fuel_entries (
      id INTEGER PRIMARY KEY,
      server_id INTEGER UNIQUE,
      route_id INTEGER,
      route_server_id INTEGER,
      amount REAL NOT NULL,
      price_per_liter REAL,
      total_cost REAL,
      station_name TEXT,
      receipt_number TEXT,
      entry_date TEXT NOT NULL,
      notes TEXT,
      is_dirty INTEGER DEFAULT 0,
      is_deleted INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      synced_at INTEGER,
      FOREIGN KEY (route_id) REFERENCES truck_routes(id) ON DELETE CASCADE
    );

    -- Odometer readings
    CREATE TABLE IF NOT EXISTS odometer_readings (
      id INTEGER PRIMARY KEY,
      server_id INTEGER UNIQUE,
      route_id INTEGER,
      route_server_id INTEGER,
      reading INTEGER NOT NULL,
      reading_date TEXT NOT NULL,
      location TEXT,
      notes TEXT,
      is_dirty INTEGER DEFAULT 0,
      is_deleted INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      synced_at INTEGER,
      FOREIGN KEY (route_id) REFERENCES truck_routes(id) ON DELETE CASCADE
    );

    -- Active routes tracking
    CREATE TABLE IF NOT EXISTS active_routes (
      id INTEGER PRIMARY KEY,
      route_data TEXT NOT NULL, -- JSON
      is_active INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    -- Sync metadata
    CREATE TABLE IF NOT EXISTS sync_metadata (
      table_name TEXT PRIMARY KEY,
      last_sync_timestamp INTEGER,
      last_sync_date TEXT,
      sync_status TEXT DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'error')),
      error_message TEXT,
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_offline_operations_status ON offline_operations(status);
    CREATE INDEX IF NOT EXISTS idx_offline_operations_timestamp ON offline_operations(timestamp);
    CREATE INDEX IF NOT EXISTS idx_truck_route_page_uid ON truck_route_page(uid);
    CREATE INDEX IF NOT EXISTS idx_truck_route_page_dirty ON truck_route_page(is_dirty);
    CREATE INDEX IF NOT EXISTS idx_truck_route_page_deleted ON truck_route_page(is_deleted);
    CREATE INDEX IF NOT EXISTS idx_truck_uid ON truck(uid);
    CREATE INDEX IF NOT EXISTS idx_truck_dirty ON truck(is_dirty);
    CREATE INDEX IF NOT EXISTS idx_truck_deleted ON truck(is_deleted);
    CREATE INDEX IF NOT EXISTS idx_truck_registration ON truck(registration_number);
    CREATE INDEX IF NOT EXISTS idx_truck_object_uid ON truck_object(uid);
    CREATE INDEX IF NOT EXISTS idx_truck_object_dirty ON truck_object(is_dirty);
    CREATE INDEX IF NOT EXISTS idx_truck_object_deleted ON truck_object(is_deleted);
    CREATE INDEX IF NOT EXISTS idx_truck_routes_dirty ON truck_routes(is_dirty);
    CREATE INDEX IF NOT EXISTS idx_truck_routes_deleted ON truck_routes(is_deleted);
    CREATE INDEX IF NOT EXISTS idx_fuel_entries_route ON fuel_entries(route_id);
    CREATE INDEX IF NOT EXISTS idx_odometer_readings_route ON odometer_readings(route_id);
    CREATE INDEX IF NOT EXISTS idx_active_routes_active ON active_routes(is_active);

    -- Insert initial sync metadata
    INSERT OR IGNORE INTO sync_metadata (table_name, last_sync_timestamp) VALUES 
      ('truck_route_page', 0),
      ('truck', 0),
      ('truck_object', 0),
      ('truck_routes', 0),
      ('fuel_entries', 0),
      ('odometer_readings', 0);
  `;

  await database.execAsync(createTablesSQL);
  console.log('Database tables created successfully');
};

// Get database instance
export const getDatabase = async (): Promise<any> => {
  if (Platform.OS === 'web') {
    throw new Error('SQLite not supported on web platform');
  }
  
  if (!db) {
    const database = await initDatabase();
    if (!database) {
      throw new Error('Failed to initialize database');
    }
    return database;
  }
  return db;
};

// Close database connection
export const closeDatabase = async () => {
  if (db) {
    await db.closeAsync();
    db = null;
    console.log('Database connection closed');
  }
};

// Database utility functions
export const executeQuery = async (sql: string, params: any[] = []): Promise<any> => {
  const database = await getDatabase();
  return await database.runAsync(sql, params);
};

export const executeSelect = async (sql: string, params: any[] = []): Promise<any[]> => {
  const database = await getDatabase();
  const result = await database.getAllAsync(sql, params);
  return result;
};

export const executeSelectFirst = async (sql: string, params: any[] = []): Promise<any | null> => {
  const database = await getDatabase();
  const result = await database.getFirstAsync(sql, params);
  return result || null;
};

// Transaction wrapper
export const executeTransaction = async (callback: (db: any) => Promise<void>) => {
  const database = await getDatabase();
  await database.withTransactionAsync(async () => {
    await callback(database);
  });
};

// Database health check
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const database = await getDatabase();
    await database.getFirstAsync('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

// Clear all data (for testing/reset)
export const clearAllData = async () => {
  const database = await getDatabase();
  await database.execAsync(`
    DELETE FROM offline_operations;
    DELETE FROM fuel_entries;
    DELETE FROM odometer_readings;
    DELETE FROM truck_routes;
    DELETE FROM truck_route_page;
    DELETE FROM truck;
    DELETE FROM truck_object;
    DELETE FROM active_routes;
    UPDATE sync_metadata SET last_sync_timestamp = 0, last_sync_date = NULL, sync_status = 'idle', error_message = NULL;
  `);
  console.log('All data cleared from database');
};

// Export backend-compatible types
export interface OfflineOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  table_name: string;
  endpoint: string;
  data: string; // JSON string
  timestamp: number;
  retries: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  error_message?: string;
  created_at: number;
  updated_at: number;
}

// Backend-compatible TruckRoutePage interface
export interface TruckRoutePage {
  uid?: string;                             // Backend primary key (optional for legacy compatibility)
  date_from?: string;                       // Backend: dateFrom (LocalDate)
  date_to?: string;                         // Backend: dateTo (LocalDate)
  truck_uid?: string;                       // Backend: truck.uid (foreign key)
  user_id?: string;                         // Backend: user.id (foreign key)
  fuel_balance_at_start?: number;           // Backend: fuelBalanceAtStart
  fuel_balance_at_end?: number;             // Backend: fuelBalanceAtFinish
  
  // Computed fields (from backend @Transient)
  total_fuel_received_on_routes?: number;   // Backend: totalFuelReceivedOnRoutes
  total_fuel_consumed_on_routes?: number;   // Backend: totalFuelConsumedOnRoutes
  fuel_balance_at_routes_finish?: number;   // Backend: fuelBalanceAtRoutesFinish
  odometer_at_route_start?: number;         // Backend: odometerAtRouteStart
  odometer_at_route_finish?: number;        // Backend: odometerAtRouteFinish
  computed_total_routes_length?: number;    // Backend: computedTotalRoutesLength
  
  // Legacy fields (for backward compatibility during transition)
  id?: number | string;                     // Legacy: local database ID
  server_id?: number;                       // Legacy: backend integer ID
  truck_route_id?: number;                  // Legacy: truck route reference
  truck_route_server_id?: number;           // Legacy: truck route server reference
  truck_registration_number?: string;       // Legacy: truck registration (now use truck_uid)
  fuel_consumption_norm?: number;           // Legacy: fuel consumption norm
  
  // Frontend-specific fields (from index.tsx)
  dateFrom?: string;                        // Frontend: camelCase version of date_from
  dateTo?: string;                          // Frontend: camelCase version of date_to
  truckRegistrationNumber?: string;         // Frontend: camelCase version of truck_registration_number
  fuelConsumptionNorm?: number;             // Frontend: camelCase version of fuel_consumption_norm
  fuelBalanceAtStart?: number;              // Frontend: camelCase version of fuel_balance_at_start
  totalFuelReceivedOnRoutes?: number | null; // Frontend: camelCase version with null support
  totalFuelConsumedOnRoutes?: number | null;  // Frontend: camelCase version with null support
  fuelBalanceAtRoutesFinish?: number | null;  // Frontend: camelCase version with null support
  odometerAtRouteStart?: number | null;       // Frontend: camelCase version with null support
  odometerAtRouteFinish?: number | null;      // Frontend: camelCase version with null support
  computedTotalRoutesLength?: number | null;  // Frontend: camelCase version with null support
  activeTab?: 'basic' | 'odometer' | 'fuel';  // Frontend: UI state
  
  // Offline-only fields
  is_dirty?: number;
  is_deleted?: number;
  created_at?: number;
  updated_at?: number;
  synced_at?: number;
}

// Backend-compatible Truck interface
export interface Truck {
  uid?: string;                             // Backend primary key (optional for legacy compatibility)
  truck_maker?: string;                     // Backend: truckMaker
  truck_model?: string;                     // Backend: truckModel
  registration_number?: string;             // Backend: registrationNumber
  fuel_consumption_norm?: number;           // Backend: fuelConsumptionNorm
  
  // Legacy fields (for backward compatibility during transition)
  id?: number | string;                     // Legacy: local database ID
  server_id?: number | string;              // Legacy: backend integer ID
  registrationNumber?: string;              // Legacy: camelCase version
  truckModel?: string;                      // Legacy: camelCase version
  truckMaker?: string;                      // Legacy: camelCase version
  fuelConsumptionNorm?: number;             // Legacy: camelCase version
  model?: string;                           // Legacy: simplified model field
  isDefault?: boolean;                      // Legacy: default truck flag
  
  // Offline-only fields
  is_dirty?: number;
  is_deleted?: number;
  created_at?: number;
  updated_at?: number;
  synced_at?: number;
}

// Backend-compatible TruckObject interface
export interface TruckObject {
  uid?: string;                             // Backend primary key (optional for legacy compatibility)
  name?: string;                            // Backend: name
  
  // Legacy fields (for backward compatibility during transition)
  id?: number | string;                     // Legacy: local database ID
  server_id?: number | string;              // Legacy: backend integer ID
  type?: string;                            // Legacy: object type field
  
  // Offline-only fields
  is_dirty?: number;
  is_deleted?: number;
  created_at?: number;
  updated_at?: number;
  synced_at?: number;
}

// Legacy interfaces (for backward compatibility during transition)
export interface TruckRoute {
  id?: number;
  server_id?: number;
  date_from: string;
  date_to: string;
  truck_registration_number: string;
  fuel_consumption_norm: number;
  fuel_balance_at_start: number;
  total_fuel_received_on_routes?: number;
  total_fuel_consumed_on_routes?: number;
  fuel_balance_at_routes_finish?: number;
  odometer_at_route_start?: number;
  odometer_at_route_finish?: number;
  computed_total_routes_length?: number;
  is_dirty?: number;
  is_deleted?: number;
  created_at?: number;
  updated_at?: number;
  synced_at?: number;
}

export interface FuelEntry {
  id?: number;
  server_id?: number;
  route_id?: number;
  route_server_id?: number;
  amount: number;
  price_per_liter?: number;
  total_cost?: number;
  station_name?: string;
  receipt_number?: string;
  entry_date: string;
  notes?: string;
  is_dirty?: number;
  is_deleted?: number;
  created_at?: number;
  updated_at?: number;
  synced_at?: number;
}

export interface OdometerReading {
  id?: number;
  server_id?: number;
  route_id?: number;
  route_server_id?: number;
  reading: number;
  reading_date: string;
  location?: string;
  notes?: string;
  is_dirty?: number;
  is_deleted?: number;
  created_at?: number;
  updated_at?: number;
  synced_at?: number;
}

export interface ActiveRoute {
  id?: number;
  route_data: string; // JSON string
  is_active?: number;
  created_at?: number;
  updated_at?: number;
}

export interface SyncMetadata {
  table_name: string;
  last_sync_timestamp?: number;
  last_sync_date?: string;
  sync_status: 'idle' | 'syncing' | 'error';
  error_message?: string;
  updated_at: number;
}

// Legacy compatibility - keep old RoutePage interface name for backward compatibility
export interface RoutePage extends TruckRoutePage {
  // This is now just an alias for TruckRoutePage
}
