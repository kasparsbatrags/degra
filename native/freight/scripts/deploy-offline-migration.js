/**
 * Offline Migration Deployment Script
 * 
 * This script automates the deployment of migrated components by:
 * 1. Backing up original files
 * 2. Replacing original files with migrated versions
 * 3. Updating imports in other files
 * 
 * Usage: node deploy-offline-migration.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const COMPONENTS_DIR = path.resolve(__dirname, '../components');
const TABS_DIR = path.resolve(__dirname, '../app/(tabs)');
const BACKUP_DIR = path.resolve(__dirname, '../backup-pre-offline-migration');

// Components to deploy
const MIGRATED_COMPONENTS = [
  {
    original: 'ImprovedFormDropdown.tsx',
    migrated: 'ImprovedFormDropdown-migrated.tsx',
    dir: COMPONENTS_DIR
  },
  {
    original: 'FormDropdown.tsx',
    migrated: 'FormDropdown-migrated.tsx',
    dir: COMPONENTS_DIR
  },
  {
    original: 'FormDropdownWithAddButton.tsx',
    migrated: 'FormDropdownWithAddButton-migrated.tsx',
    dir: COMPONENTS_DIR
  },
  {
    original: 'ImprovedFormDropdownWithAddButton.tsx',
    migrated: 'ImprovedFormDropdownWithAddButton-migrated.tsx',
    dir: COMPONENTS_DIR
  },
  {
    original: 'CompanySearch.tsx',
    migrated: 'CompanySearch-migrated.tsx',
    dir: COMPONENTS_DIR
  },
  {
    original: 'AddTruckObjectScreen.tsx',
    migrated: 'AddTruckObjectScreen-migrated.tsx',
    dir: COMPONENTS_DIR
  },
  {
    original: 'index.tsx',
    migrated: 'index-migrated.tsx',
    dir: TABS_DIR
  },
  {
    original: 'profile.tsx',
    migrated: 'profile-migrated.tsx',
    dir: TABS_DIR
  },
  {
    original: 'truck-route-page.tsx',
    migrated: 'truck-route-page-simple-migrated.tsx',
    dir: TABS_DIR
  }
];

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  fs.mkdirSync(path.join(BACKUP_DIR, 'components'), { recursive: true });
  fs.mkdirSync(path.join(BACKUP_DIR, 'app/(tabs)'), { recursive: true });
  console.log(`✅ Created backup directory: ${BACKUP_DIR}`);
}

// Function to backup and deploy a component
function deployComponent(component) {
  const originalPath = path.join(component.dir, component.original);
  const migratedPath = path.join(component.dir, component.migrated);
  const backupPath = path.join(
    BACKUP_DIR, 
    component.dir === COMPONENTS_DIR ? 'components' : 'app/(tabs)', 
    component.original
  );

  // Check if files exist
  if (!fs.existsSync(originalPath)) {
    console.error(`❌ Original file not found: ${originalPath}`);
    return false;
  }

  if (!fs.existsSync(migratedPath)) {
    console.error(`❌ Migrated file not found: ${migratedPath}`);
    return false;
  }

  try {
    // Backup original file
    fs.copyFileSync(originalPath, backupPath);
    console.log(`✅ Backed up: ${component.original} → ${backupPath}`);

    // Replace original with migrated
    fs.copyFileSync(migratedPath, originalPath);
    console.log(`✅ Deployed: ${component.migrated} → ${originalPath}`);

    return true;
  } catch (error) {
    console.error(`❌ Error deploying ${component.original}:`, error.message);
    return false;
  }
}

// Main deployment function
function deployOfflineMigration() {
  console.log('🚀 Starting Offline Migration Deployment');
  console.log('=======================================');

  // Create git branch for deployment
  try {
    execSync('git checkout -b offline-migration-deployment');
    console.log('✅ Created git branch: offline-migration-deployment');
  } catch (error) {
    console.log('⚠️ Could not create git branch, continuing anyway...');
  }

  // Deploy each component
  let successCount = 0;
  for (const component of MIGRATED_COMPONENTS) {
    if (deployComponent(component)) {
      successCount++;
    }
  }

  // Update TruckRoute component (special case with subdirectory)
  try {
    const truckRouteOriginal = path.join(COMPONENTS_DIR, 'TruckRoute/index.tsx');
    const truckRouteMigrated = path.join(COMPONENTS_DIR, 'TruckRoute/index-simple-migrated.tsx');
    const truckRouteBackup = path.join(BACKUP_DIR, 'components/TruckRoute/index.tsx');
    
    // Create backup directory for TruckRoute
    fs.mkdirSync(path.join(BACKUP_DIR, 'components/TruckRoute'), { recursive: true });
    
    // Backup and deploy
    fs.copyFileSync(truckRouteOriginal, truckRouteBackup);
    fs.copyFileSync(truckRouteMigrated, truckRouteOriginal);
    
    console.log(`✅ Backed up: TruckRoute/index.tsx → ${truckRouteBackup}`);
    console.log(`✅ Deployed: TruckRoute/index-simple-migrated.tsx → ${truckRouteOriginal}`);
    successCount++;
  } catch (error) {
    console.error('❌ Error deploying TruckRoute component:', error.message);
  }

  // Summary
  console.log('\n=======================================');
  console.log(`✅ Deployment complete: ${successCount}/${MIGRATED_COMPONENTS.length + 1} components deployed`);
  console.log(`📁 Backup created at: ${BACKUP_DIR}`);
  console.log('\n🔄 Next steps:');
  console.log('1. Run tests to verify the deployment');
  console.log('2. Commit changes: git add . && git commit -m "Deploy offline migration"');
  console.log('3. Create PR: git push -u origin offline-migration-deployment');
  console.log('=======================================');
}

// Execute deployment
deployOfflineMigration();
