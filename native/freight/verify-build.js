#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Android build outputs...\n');

const debugApkPath = path.join(__dirname, 'android/app/build/outputs/apk/debug/app-debug.apk');
const releaseApkPath = path.join(__dirname, 'android/app/build/outputs/apk/release/app-release.apk');

console.log('Debug APK path:', debugApkPath);
console.log('Debug APK exists:', fs.existsSync(debugApkPath) ? '✅ YES' : '❌ NO');

console.log('\nRelease APK path:', releaseApkPath);
console.log('Release APK exists:', fs.existsSync(releaseApkPath) ? '✅ YES' : '❌ NO');

if (fs.existsSync(releaseApkPath)) {
  const stats = fs.statSync(releaseApkPath);
  console.log('Release APK size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
  console.log('Release APK created:', stats.mtime.toLocaleString());
}

if (fs.existsSync(debugApkPath)) {
  const stats = fs.statSync(debugApkPath);
  console.log('Debug APK size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');
  console.log('Debug APK created:', stats.mtime.toLocaleString());
}

console.log('\n📱 To install the release APK manually:');
console.log('adb install android/app/build/outputs/apk/release/app-release.apk');
