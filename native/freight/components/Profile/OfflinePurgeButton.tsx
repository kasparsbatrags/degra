import React from 'react';
import { Alert, Button, View, Platform } from 'react-native';
import { purgeAllOfflineData } from '@/utils/offlinePurge';

const OfflinePurgeButton: React.FC = () => {
  // Show only on mobile (not web)
  if (Platform.OS === 'web') {
    return null;
  }

  const handlePurge = async () => {
    Alert.alert(
      'Apstiprināt',
      'Vai tiešām vēlaties dzēst visus offline datus? Šo darbību nevar atcelt.',
      [
        { text: 'Atcelt', style: 'cancel' },
        {
          text: 'Dzēst',
          style: 'destructive',
          onPress: async () => {
            try {
              await purgeAllOfflineData();
              Alert.alert('Veiksmīgi', 'Visi offline dati ir nodzēsti.');
            } catch (e) {
              Alert.alert('Kļūda', 'Neizdevās nodzēst offline datus.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ marginVertical: 16 }}>
      <Button
        title="Notīrīt visus offline datus"
        color="#d32f2f"
        onPress={handlePurge}
      />
    </View>
  );
};

export default OfflinePurgeButton;
