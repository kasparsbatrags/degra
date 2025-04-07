import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCurrentEnvironmentName } from '../config/environment';

/**
 * Komponents, kas attēlo pašreizējo vidi (izstrādes vai testa)
 * Produkcijas vidē šis komponents neko neattēlo
 */
const EnvironmentIndicator: React.FC = () => {
  const env = getCurrentEnvironmentName();
  
  // Nerādīt produkcijas vidē
  if (env === 'production') return null;
  
  // Krāsas atkarībā no vides
  const bgColor = env === 'development' ? '#3498db' : '#f39c12';
  
  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={styles.text}>
        {env.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1000,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  }
});

export default EnvironmentIndicator;
