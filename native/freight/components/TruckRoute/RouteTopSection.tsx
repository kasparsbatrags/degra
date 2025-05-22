import React from 'react';
import { View } from 'react-native';
import { RouteTopSectionProps } from '@/types/truckRouteTypes';
import { styles } from './styles';

const RouteTopSection: React.FC<RouteTopSectionProps> = () => {
    // Tukša komponente, jo visi lauki ir pārvietoti uz attiecīgajām tabām
    return (
        <View id="top" style={[styles.topContainer]}>
            {/* Tukša komponente */}
        </View>
    );
};

export default RouteTopSection;
