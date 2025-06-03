import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Database configuration
const DATABASE_NAME = 'freight_offline.db';
const DATABASE_VERSION = 1;

// Database instance
let db: SQLite.SQLiteDatabase | null = null;

// Initialize database
export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }

  try {
    if (Platform.OS === 'web') {
      // For web, we'll use a different approach or fallback to AsyncStorage
      console.warn('SQLite not fully supported on web, falling back to AsyncStorage');
      throw new Error('SQLite not supported on web');
    }

    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    
    // Enable foreign keys
    await db.execAsync('PRAGMA foreign_keys = ON;');
    
    // Create tables
    await createTables(db);
    
    // Initialize extended tables
    try {
      const databaseExtended = require('./databaseExtended');
      await databaseExtended.createExtendedTables(db);
      console.log('Extended database tables initialized successfully');
    } catch (error) {
      console.error('Failed to initialize extended tables:', error);
    }

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Create database tables
const createTables = async (database: SQLite.SQLiteDatabase) => {
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

    -- Route pages
    CREATE TABLE IF NOT EXISTS route_pages (
      id INTEGER PRIMARY KEY,
      server_id INTEGER UNIQUE,
      truck_route_id INTEGER,
      truck_route_server_id INTEGER,
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
      synced_at INTEGER,
      FOREIGN KEY (truck_route_id) REFERENCES truck_routes(id) ON DELETE CASCADE
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
    CREATE INDEX IF NOT EXISTS idx_truck_routes_dirty ON truck_routes(is_dirty);
    CREATE INDEX IF NOT EXISTS idx_truck_routes_deleted ON truck_routes(is_deleted);
    CREATE INDEX IF NOT EXISTS idx_route_pages_dirty ON route_pages(is_dirty);
    CREATE INDEX IF NOT EXISTS idx_route_pages_deleted ON route_pages(is_deleted);
    CREATE INDEX IF NOT EXISTS idx_fuel_entries_route ON fuel_entries(route_id);
    CREATE INDEX IF NOT EXISTS idx_odometer_readings_route ON odometer_readings(route_id);

    -- Insert initial sync metadata
    INSERT OR IGNORE INTO sync_metadata (table_name, last_sync_timestamp) VALUES 
      ('truck_routes', 0),
      ('route_pages', 0),
      ('fuel_entries', 0),
      ('odometer_readings', 0);
  `;

  await database.execAsync(createTablesSQL);
  console.log('Database tables created successfully');
};

// Get database instance
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    return await initDatabase();
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
export const executeQuery = async (sql: string, params: any[] = []): Promise<SQLite.SQLiteRunResult> => {
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
export const executeTransaction = async (callback: (db: SQLite.SQLiteDatabase) => Promise<void>) => {
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
    DELETE FROM route_pages;
    DELETE FROM truck_routes;
    UPDATE sync_metadata SET last_sync_timestamp = 0, last_sync_date = NULL, sync_status = 'idle', error_message = NULL;
  `);
  console.log('All data cleared from database');
};

// Export types for TypeScript
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

export interface RoutePage {
  id?: number;
  server_id?: number;
  truck_route_id?: number;
  truck_route_server_id?: number;
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

export interface SyncMetadata {
  table_name: string;
  last_sync_timestamp?: number;
  last_sync_date?: string;
  sync_status: 'idle' | 'syncing' | 'error';
  error_message?: string;
  updated_at: number;
}
