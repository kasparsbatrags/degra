import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { RouteTable } from './components/web/RouteTable';
import { TruckRoutePageDto } from '@/dto/TruckRoutePageDto';

// Mock data for testing
const mockRoutes: TruckRoutePageDto[] = [
  {
    uid: '1',
    dateFrom: '2024-01-15',
    dateTo: '2024-01-16',
    truck: { registrationNumber: 'AA-1234' },
    user: { id: '1', givenName: 'Jānis', familyName: 'Bērziņš' },
    computedTotalRoutesLength: 250,
    fuelBalanceAtStart: 180
  },
  {
    uid: '2',
    dateFrom: '2024-01-16',
    dateTo: '2024-01-17',
    truck: { registrationNumber: 'BB-5678' },
    user: { id: '2', givenName: 'Anna', familyName: 'Kārkliņa' },
    computedTotalRoutesLength: 420,
    fuelBalanceAtStart: 220
  },
  {
    uid: '3',
    dateFrom: '2024-01-17',
    dateTo: '2024-01-18',
    truck: { registrationNumber: 'CC-9012' },
    user: { id: '3', givenName: 'Pēteris', familyName: 'Ozoliņš' },
    computedTotalRoutesLength: 310,
    fuelBalanceAtStart: 150
  }
];

export default function TestRouteTable() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5', padding: 20 }}>
      <Text style={{
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#1f2937'
      }}>
        React Native Compatible Table Test
      </Text>
      
      <RouteTable 
        routes={mockRoutes}
        loading={false}
        onRefresh={() => {}}
      />
    </ScrollView>
  );
}