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

    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      given_name TEXT NOT NULL,
      family_name TEXT NOT NULL,

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
      is_default DEFAULT false,
      
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

    -- Truck routes (backend-compatible structure)
    CREATE TABLE IF NOT EXISTS truck_routes (
      uid TEXT PRIMARY KEY,
      truck_route_page_uid TEXT NOT NULL,
      route_date TEXT NOT NULL,
      route_number INTEGER,
      cargo_volume REAL DEFAULT 0,
      out_truck_object_uid TEXT NOT NULL,
      odometer_at_start INTEGER NOT NULL,
      out_date_time TEXT NOT NULL,
      odometer_at_finish INTEGER,
      in_truck_object_uid TEXT,
      in_date_time TEXT,
      route_length INTEGER,
      fuel_balance_at_start REAL,
      fuel_consumed REAL,
      fuel_received REAL,
      fuel_balance_at_finish REAL,
      created_date_time TEXT,
      last_modified_date_time TEXT,
      unit_type_id INTEGER,
      
      -- Offline fields
      is_dirty INTEGER DEFAULT 0,
      is_deleted INTEGER DEFAULT 0,
      synced_at INTEGER
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
    CREATE INDEX IF NOT EXISTS idx_truck_routes_page_uid ON truck_routes(truck_route_page_uid);
    CREATE INDEX IF NOT EXISTS idx_truck_routes_out_object ON truck_routes(out_truck_object_uid);
    CREATE INDEX IF NOT EXISTS idx_truck_routes_in_object ON truck_routes(in_truck_object_uid);
    CREATE INDEX IF NOT EXISTS idx_truck_routes_date ON truck_routes(route_date);
    CREATE INDEX IF NOT EXISTS idx_truck_routes_active ON truck_routes(in_date_time);

    -- Insert initial sync metadata
    INSERT OR IGNORE INTO sync_metadata (table_name, last_sync_timestamp) VALUES 
      ('truck_route_page', 0),
      ('truck', 0),
      ('truck_object', 0),
      ('truck_routes', 0);
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

export const clearAllData = async () => {
  const database = await getDatabase();
  await database.execAsync(`
    DELETE FROM offline_operations;
    DELETE FROM truck_routes;
    DELETE FROM truck_route_page;
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
