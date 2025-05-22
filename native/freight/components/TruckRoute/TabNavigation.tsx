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
				style={[styles.tabButton, activeTab === 'basic' && styles.tabButtonActive]}
				onPress={() => setActiveTab('basic')}
			>
				{Platform.OS === 'web' ? (
					<Text style={[styles.tabText, activeTab === 'basic' && styles.tabTextActive]}>Pamatinfo</Text>
				) : (
					<MaterialIcons 
						name="info" 
						size={24} 
						color={activeTab === 'basic' ? COLORS.white : COLORS.gray} 
					/>
				)}
			</Pressable>
			
			<Pressable
				style={[styles.tabButton, activeTab === 'odometer' && styles.tabButtonActive]}
				onPress={() => setActiveTab('odometer')}
			>
				{Platform.OS === 'web' ? (
					<Text style={[styles.tabText, activeTab === 'odometer' && styles.tabTextActive]}>Odometrs</Text>
				) : (
					<MaterialIcons 
						name="speed" 
						size={24} 
						color={activeTab === 'odometer' ? COLORS.white : COLORS.gray} 
					/>
				)}
			</Pressable>
			
			<Pressable
				style={[styles.tabButton, activeTab === 'fuel' && styles.tabButtonActive]}
				onPress={() => setActiveTab('fuel')}
			>
				{Platform.OS === 'web' ? (
					<Text style={[styles.tabText, activeTab === 'fuel' && styles.tabTextActive]}>Degviela</Text>
				) : (
					<MaterialIcons 
						name="local-gas-station" 
						size={24} 
						color={activeTab === 'fuel' ? COLORS.white : COLORS.gray} 
					/>
				)}
			</Pressable>
		</View>
	);
};

export default TabNavigation;
