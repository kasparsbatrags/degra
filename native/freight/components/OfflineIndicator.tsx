import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../constants/theme';
import { useOfflineStatus, useQueueStats } from '../context/OfflineContext';

/**
 * Component that shows an indicator when the app is offline
 * or has pending data to sync
 */
export default function OfflineIndicator() {
  const { isOnline, hasOfflineData, syncNeeded, hasErrors } = useOfflineStatus();
  const queueStats = useQueueStats();
  
  // If connected and no pending data, don't show anything
  if (isOnline && !hasOfflineData) return null;
  
  // Determine indicator message and color
  let message = '';
  let backgroundColor = COLORS.warning;
  
  if (hasErrors) {
    message = `Sinhronizācijas kļūda - ${queueStats.failed} operācijas neizdevās`;
    backgroundColor = '#FF6B6B'; // Red for errors
  } else if (syncNeeded) {
    message = `Notiek datu sinhronizācija... (${queueStats.pending} operācijas)`;
    backgroundColor = '#4ECDC4'; // Teal for syncing
  }
  
  if (!message) return null;
  
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.text}>
        {message}
      </Text>
      {queueStats.total > 0 && (
        <Text style={styles.statsText}>
          Rindā: {queueStats.pending} | Kļūdas: {queueStats.failed} | Pabeigtas: {queueStats.completed}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: Platform.OS === 'web' ? {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  } : {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  text: {
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
  statsText: {
    color: COLORS.white,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.9,
  },
});
