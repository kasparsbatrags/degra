import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Extended database schema with trucks, objects, and active routes
export const createExtendedTables = async (database: SQLite.SQLiteDatabase) => {
  const extendedTablesSQL = `
    -- Trucks table
    CREATE TABLE IF NOT EXISTS trucks (
      id INTEGER PRIMARY KEY,
      server_id INTEGER UNIQUE,
      registration_number TEXT NOT NULL,
      model TEXT,
      fuel_consumption_norm REAL,
      is_dirty INTEGER DEFAULT 0,
      is_deleted INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      synced_at INTEGER
    );

    -- Objects table
    CREATE TABLE IF NOT EXISTS objects (
      id INTEGER PRIMARY KEY,
      server_id INTEGER UNIQUE,
      name TEXT NOT NULL,
      type TEXT,
      is_dirty INTEGER DEFAULT 0,
      is_deleted INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      synced_at INTEGER
    );

    -- Active routes tracking
    CREATE TABLE IF NOT EXISTS active_routes (
      id INTEGER PRIMARY KEY,
      route_data TEXT NOT NULL, -- JSON
      is_active INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    -- Create additional indexes
    CREATE INDEX IF NOT EXISTS idx_trucks_dirty ON trucks(is_dirty);
    CREATE INDEX IF NOT EXISTS idx_trucks_deleted ON trucks(is_deleted);
    CREATE INDEX IF NOT EXISTS idx_trucks_registration ON trucks(registration_number);
    CREATE INDEX IF NOT EXISTS idx_objects_dirty ON objects(is_dirty);
    CREATE INDEX IF NOT EXISTS idx_objects_deleted ON objects(is_deleted);
    CREATE INDEX IF NOT EXISTS idx_objects_name ON objects(name);
    CREATE INDEX IF NOT EXISTS idx_active_routes_active ON active_routes(is_active);

    -- Insert additional sync metadata
    INSERT OR IGNORE INTO sync_metadata (table_name, last_sync_timestamp) VALUES 
      ('trucks', 0),
      ('objects', 0);
  `;

  await database.execAsync(extendedTablesSQL);
  console.log('Extended database tables created successfully');
};

// Export types for new tables
export interface Truck {
  id?: number;
  server_id?: number;
  registration_number: string;
  model?: string;
  fuel_consumption_norm?: number;
  is_dirty?: number;
  is_deleted?: number;
  created_at?: number;
  updated_at?: number;
  synced_at?: number;
}

export interface TruckObject {
  id?: number;
  server_id?: number;
  name: string;
  type?: string;
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
