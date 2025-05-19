import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { COLORS } from '@/constants/theme';
import { TabNavigationProps } from '@/types/truckRouteTypes';
import { styles } from './styles';

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
	return (
		<View style={styles.tabContainer}>
			<Pressable
				style={[styles.tabButton, activeTab === 0 && styles.tabButtonActive]}
				onPress={() => setActiveTab(0)}
			>
				{Platform.OS === 'web' ? (
					<Text style={[styles.tabText, activeTab === 0 && styles.tabTextActive]}>Info</Text>
				) : (
					<MaterialIcons 
						name="info" 
						size={24} 
						color={activeTab === 0 ? COLORS.white : COLORS.gray} 
					/>
				)}
			</Pressable>
			
			<Pressable
				style={[styles.tabButton, activeTab === 1 && styles.tabButtonActive]}
				onPress={() => setActiveTab(1)}
			>
				{Platform.OS === 'web' ? (
					<Text style={[styles.tabText, activeTab === 1 && styles.tabTextActive]}>Papildus</Text>
				) : (
					<MaterialIcons 
						name="more-horiz" 
						size={24} 
						color={activeTab === 1 ? COLORS.white : COLORS.gray} 
					/>
				)}
			</Pressable>
		</View>
	);
};

export default TabNavigation;
