import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';
import AddTruckObjectScreenOfflineSimple from '@/components/AddTruckObjectScreenOfflineSimple';
import { Stack } from 'expo-router';

export default function AddTruckObjectPage() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Pievienot objektu',
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
      }} />
      <AddTruckObjectScreenOfflineSimple />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
});
