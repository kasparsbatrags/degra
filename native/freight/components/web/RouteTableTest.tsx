import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { RouteTable } from './RouteTable';
import { TruckRoutePageDto } from '@/dto/TruckRoutePageDto';

// Mock data for testing
const mockRoutes: TruckRoutePageDto[] = [
  {
    uid: '1',
    dateFrom: '2024-01-15',
    dateTo: '2024-01-16',
    truck: {
      registrationNumber: 'AA-1234'
    },
    user: {
      id: '1',
      givenName: 'Jānis',
      familyName: 'Bērziņš'
    },
    computedTotalRoutesLength: 250,
    fuelBalanceAtStart: 180
  },
  {
    uid: '2',
    dateFrom: '2024-01-16',
    dateTo: '2024-01-17',
    truck: {
      registrationNumber: 'BB-5678'
    },
    user: {
      id: '2',
      givenName: 'Anna',
      familyName: 'Kārkliņa'
    },
    computedTotalRoutesLength: 420,
    fuelBalanceAtStart: 220
  },
  {
    uid: '3',
    dateFrom: '2024-01-17',
    dateTo: '2024-01-18',
    truck: {
      registrationNumber: 'CC-9012'
    },
    user: {
      id: '3',
      givenName: 'Pēteris',
      familyName: 'Ozoliņš'
    },
    computedTotalRoutesLength: 310,
    fuelBalanceAtStart: 150
  },
  {
    uid: '4',
    dateFrom: '2024-01-18',
    dateTo: '2024-01-19',
    truck: {
      registrationNumber: 'DD-3456'
    },
    user: {
      id: '4',
      givenName: 'Līga',
      familyName: 'Liepiņa'
    },
    computedTotalRoutesLength: 180,
    fuelBalanceAtStart: 190
  },
  {
    uid: '5',
    dateFrom: '2024-01-19',
    dateTo: '2024-01-20',
    truck: {
      registrationNumber: 'EE-7890'
    },
    user: {
      id: '5',
      givenName: 'Māris',
      familyName: 'Kalniņš'
    },
    computedTotalRoutesLength: 375,
    fuelBalanceAtStart: 205
  }
];

export const RouteTableTest: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#f5f5f5' }}>
      <Text style={{
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#1f2937'
      }}>
        Route Table Test
      </Text>
      
      <RouteTable 
        routes={mockRoutes}
        loading={loading}
        onRefresh={handleRefresh}
      />
    </View>
  );
};

export default RouteTableTest;