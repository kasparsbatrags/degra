import { StyleSheet, Platform } from 'react-native';
import { COLORS, CONTAINER_WIDTH, SHADOWS } from '@/constants/theme';
import { commonStyles } from '@/constants/styles';

export const styles = StyleSheet.create({
	webContainer: Platform.OS === 'web' ? {
		width: '100%', maxWidth: CONTAINER_WIDTH.web, alignSelf: 'center',
	} : {},
	topContainer: {
		marginBottom: 0,
	},
	truckField: {
		marginTop: 16 ,
		flex: 1,
	},
	explanatoryText: Platform.OS === 'web' ? {
		...commonStyles.text,
		backgroundColor: COLORS.black100,
		padding: 16,
		borderRadius: 8,
		marginBottom: 16,
		textAlign: 'center',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.05)',
		...SHADOWS.small,
	} : {
		...commonStyles.text,
		borderRadius: 8,
		marginBottom: 16,
		textAlign: 'center',
	},
	buttonContainer: {
		justifyContent: 'space-between', gap: 16,
		marginTop:  Platform.OS === 'web' ? 24 : 8,
	},
	backButton: Platform.OS === 'web' ? {
		flex: 1,
		backgroundColor: COLORS.black100,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.05)',
		...SHADOWS.small,
	} : {
		flex: 1,
		backgroundColor: COLORS.black100,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.15)',
		...SHADOWS.medium,
	},
	submitButton: Platform.OS === 'web' ? {
		flex: 1,
		...SHADOWS.small,
	} : {
		flex: 1,
		...SHADOWS.medium,
	},
	errorBorder: Platform.OS === 'web' ? {
		padding: 16,
		borderWidth: 2,
		borderColor: 'rgb(255, 156, 1)',
		borderRadius: 8,
		...SHADOWS.small,
	} : {
		padding: 16,
		borderWidth: 2,
		borderColor: 'rgb(255, 156, 1)',
		borderRadius: 8,
		...SHADOWS.medium,
	},
	atStartContainer: {
		width: '100%', gap: 16,
	},
	inputWrapper: {
		flex: 1,
		minWidth: '48%' ,
	},
	// Tab navigācijas stili
	tabContainer: Platform.OS === 'web' ? {
		flexDirection: 'row',
		marginBottom: 0, // Noņemta atstarpe starp tab un saturu
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		overflow: 'hidden',
		backgroundColor: COLORS.black200,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.08)',
		borderBottomWidth: 0, // Noņemta apakšējā robeža
	} : {
		flexDirection: 'row',
		marginBottom: 0, // Noņemta atstarpe starp tab un saturu
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		overflow: 'hidden',
		backgroundColor: COLORS.black200,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.2)', // Increased opacity for mobile
		borderBottomWidth: 0, // Noņemta apakšējā robeža
	},
	tabButton: {
		flex: 1, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center',
	},
	tabButtonActive: Platform.OS === 'web' ? {
		backgroundColor: COLORS.secondary, // Atgriezamies pie oriģinālās krāsas
		...SHADOWS.small,
	} : {
		backgroundColor: COLORS.secondary, // Atgriezamies pie oriģinālās krāsas
		...SHADOWS.medium, // Using medium shadows for better visibility on mobile
	},
	tabText: {
		fontSize: 14, color: COLORS.gray,
	},
	tabTextActive: {
		color: COLORS.white, fontWeight: '600',
	},
	// Tab satura stili
	tabContentContainer: Platform.OS === 'web' ? {
		backgroundColor: COLORS.primary, // Tumšāks fons nekā ievadlaukiem
		borderBottomLeftRadius: 8, // Tikai apakšējie stūri ir noapaļoti
		borderBottomRightRadius: 8,
		padding: 16,
		marginBottom: 16,
		borderWidth: 1,
		borderTopWidth: 0, // Noņemta augšējā robeža, lai savienotu ar tab
		borderColor: 'rgba(255, 255, 255, 0.05)',
		...SHADOWS.small,
	} : {
		backgroundColor: COLORS.primary, // Tumšāks fons nekā ievadlaukiem
		borderBottomLeftRadius: 8, // Tikai apakšējie stūri ir noapaļoti
		borderBottomRightRadius: 8,
		padding: 16,
		marginBottom: 16,
		borderWidth: 1,
		borderTopWidth: 0, // Noņemta augšējā robeža, lai savienotu ar tab
		borderColor: 'rgba(255, 255, 255, 0.15)',
		...SHADOWS.medium,
	},
	infoTabContent: {
		borderLeftWidth: 3,
		borderLeftColor: COLORS.secondary,
	},
	additionalTabContent: {
		backgroundColor: '#131320', // Nedaudz gaišāks nekā primary, bet tumšāks nekā ievadlauki
		borderLeftWidth: 3,
		borderLeftColor: COLORS.gray,
	},
	basicTabContent: {
		borderLeftWidth: 3,
		borderLeftColor: COLORS.secondary,
	},
	odometerTabContent: {
		borderLeftWidth: 3,
		borderLeftColor: COLORS.highlight,
	},
	fuelTabContent: {
		borderLeftWidth: 3,
		borderLeftColor: COLORS.gray,
	},
});
