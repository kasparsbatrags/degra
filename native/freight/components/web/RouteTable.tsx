import {useAuth} from '@/context/AuthContext'
import {TruckRoutePageDto} from '@/dto/TruckRoutePageDto'
import usePlatform from '@/hooks/usePlatform'
import {useRouter} from 'expo-router'
import React, {useMemo, useState} from 'react'
import {ActivityIndicator, ScrollView, Text, TouchableOpacity, View} from 'react-native'
import Pagination from '../Pagination'

type SortField =
		'dateFrom'
		| 'registrationNumber'
		| 'odometerAtRouteStart'
		| 'odometerAtRouteFinish'
		| 'computedTotalRoutesLength'
		| 'fuelBalanceAtStart'
		| 'fuelBalanceAtFinish'
		;
type SortDirection = 'asc' | 'desc';

interface RouteTableProps {
	routes: TruckRoutePageDto[];
	loading: boolean;
	onRefresh?: () => void;
	onDelete?: (uid: string) => Promise<void>;
	deletingRoute?: string | null;
}

export const RouteTable: React.FC<RouteTableProps> = ({
	routes, loading, onRefresh, onDelete, deletingRoute = null
}) => {
	const {user} = useAuth()
	const router = useRouter()
	const [sortField, setSortField] = useState<SortField>('dateFrom')
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
	const [currentPage, setCurrentPage] = useState(0)
	const [itemsPerPage] = useState(10)
	const { isWeb } = usePlatform()

	// Delete handler with simple confirmation
	const handleDeleteClick = (uid: string, e: any) => {
		e.stopPropagation()

		const confirmed = window.confirm(
			'Vai esat pārliecināts, ka vēlaties dzēst šo maršruta lapu? Šo darbību nevar atsaukt.'
		)

		if (confirmed && onDelete) {
			onDelete(uid)
		}
	}

	// Sorting function
	const sortedRoutes = useMemo(() => {
		return [...routes].sort((a, b) => {
			let aValue: any, bValue: any

			switch (sortField) {
				case 'dateFrom':
					aValue = new Date(a.dateFrom)
					bValue = new Date(b.dateFrom)
					break
				case 'registrationNumber':
					aValue = a.truck?.registrationNumber || ''
					bValue = b.truck?.registrationNumber || ''
					break
				case 'odometerAtRouteStart':
					aValue = a.odometerAtRouteStart || 0
					bValue = b.odometerAtRouteStart || 0
					break
				case 'odometerAtRouteFinish':
					aValue = a.odometerAtRouteFinish || 0
					bValue = b.odometerAtRouteFinish || 0
					break
				case 'computedTotalRoutesLength':
					aValue = a.computedTotalRoutesLength || 0
					bValue = b.computedTotalRoutesLength || 0
					break
				case 'fuelBalanceAtStart':
					aValue = a.fuelBalanceAtStart || 0
					bValue = b.fuelBalanceAtStart || 0
					break
				case 'fuelBalanceAtFinish':
					aValue = a.fuelBalanceAtFinish || 0
					bValue = b.fuelBalanceAtFinish || 0
					break

				default:
					return 0
			}

			if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
			if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
			return 0
		})
	}, [routes, sortField, sortDirection])

	// Pagination
	const totalPages = Math.ceil(sortedRoutes.length / itemsPerPage)
	const paginatedRoutes = useMemo(() => {
		const startIndex = currentPage * itemsPerPage
		return sortedRoutes.slice(startIndex, startIndex + itemsPerPage)
	}, [sortedRoutes, currentPage, itemsPerPage])

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
		} else {
			setSortField(field)
			setSortDirection('asc')
		}
		setCurrentPage(0) // Reset to first page when sorting
	}

	const handlePageChange = (page: number) => {
		setCurrentPage(page)
	}

	const handleRowClick = (route: TruckRoutePageDto) => {
		router.push({
			pathname: '/(tabs)/truck-route-page', params: {uid: route.uid}
		})
	}

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString('lv-LV', {
			day: '2-digit', month: '2-digit', year: 'numeric'
		})
	}

	const formatNumber = (num?: number) => {
		return num?.toLocaleString() ?? '0'
	}

	const getSortIcon = (field: SortField) => {
		if (sortField !== field) return ' ↕'
		return sortDirection === 'asc' ? ' ↑' : ' ↓'
	}

	if (loading) {
		return (<View className="degra-content-section" style={{alignItems: 'center', padding: 40}}>
					<ActivityIndicator size="large" color="#3b82f6" />
					<Text style={{
						marginTop: 16, fontSize: 16, color: '#6b7280', textAlign: 'center'
					}}>
						Ielādē maršrutu lapas...
					</Text>
				</View>)
	}

	if (routes.length === 0 && !isWeb) {
		return (<View className="degra-content-section animated fadeIn" style={{alignItems: 'center', padding: 40}}>
					<Text style={{
						fontSize: 18, color: '#6b7280', textAlign: 'center', fontFamily: 'system-ui',
					}}>
						Nav pieejamu maršrutu lapu
					</Text>
					{onRefresh && (<TouchableOpacity
									className="degra-button"
									style={{marginTop: 16, paddingHorizontal: 24, paddingVertical: 12}}
									onPress={onRefresh}
							>
								<Text style={{color: 'white', fontSize: 16}}>Atjaunot</Text>
							</TouchableOpacity>)}
				</View>)
	}

	return (<View style={{
				backgroundColor: 'white',
				borderRadius: 12,
				padding: 24,
				shadowColor: '#000',
				shadowOffset: {width: 0, height: 2},
				shadowOpacity: 0.1,
				shadowRadius: 8,
				elevation: 8,
				marginBottom: 20,
				alignItems: 'center',
			}}>

				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					<View style={{minWidth: 1000}}>
						{/* Header Row */}
						<View style={{
							flexDirection: 'row',
							backgroundColor: '#f8fafc',
							borderBottomWidth: 2,
							borderBottomColor: '#e2e8f0',
							paddingVertical: 16,
						}}>
							<TouchableOpacity
									style={{width: 200, paddingHorizontal: 12}}
									onPress={() => handleSort('dateFrom')}
							>
								<Text style={{
									fontWeight: '600', color: '#374151', fontSize: 14,
								}}>
									Periods{getSortIcon('dateFrom')}
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
									style={{width: 100, paddingHorizontal: 12}}
									onPress={() => handleSort('registrationNumber')}
							>
								<Text style={{
									fontWeight: '600', color: '#374151', fontSize: 14,
								}}>
									Auto{getSortIcon('registrationNumber')}
								</Text>
							</TouchableOpacity>

							<View style={{width: 150, paddingHorizontal: 12}}>
								<Text style={{
									fontWeight: '600', color: '#374151', fontSize: 14,
								}}>
									Vadītājs
								</Text>
							</View>

							<TouchableOpacity
									style={{width: 120, paddingHorizontal: 12}}
									onPress={() => handleSort('odometerAtRouteStart')}
							>
								<Text style={{
									fontWeight: '600', color: '#374151', fontSize: 14,
								}}>
									Odometrs sākumā {getSortIcon('odometerAtRouteStart')}
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
									style={{width: 120, paddingHorizontal: 12}}
									onPress={() => handleSort('odometerAtRouteFinish')}
							>
								<Text style={{
									fontWeight: '600', color: '#374151', fontSize: 14,
								}}>
									Odometrs beigās {getSortIcon('odometerAtRouteFinish')}
								</Text>
							</TouchableOpacity>


							<TouchableOpacity
									style={{width: 120, paddingHorizontal: 12}}
									onPress={() => handleSort('computedTotalRoutesLength')}
							>
								<Text style={{
									fontWeight: '600', color: '#374151', fontSize: 14,
								}}>
									Distance{getSortIcon('computedTotalRoutesLength')}
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
									style={{width: 100, paddingHorizontal: 12}}
									onPress={() => handleSort('fuelBalanceAtStart')}
							>
								<Text style={{
									fontWeight: '600', color: '#374151', fontSize: 14,
								}}>
									Degvielas atlikums sākumā{getSortIcon('fuelBalanceAtStart')}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
									style={{width: 100, paddingHorizontal: 12}}
									onPress={() => handleSort('fuelBalanceAtFinish')}
							>
								<Text style={{
									fontWeight: '600', color: '#374151', fontSize: 14,
								}}>
									Degvielas atlikums beigās{getSortIcon('fuelBalanceAtFinish')}
								</Text>
							</TouchableOpacity>
							<View style={{width: 120, paddingHorizontal: 12}}>
								<Text style={{
									fontWeight: '600', color: '#374151', fontSize: 14,
								}}>
									Darbības
								</Text>
							</View>
						</View>

						{/* Table Body */}
						{paginatedRoutes.map((route, index) => (<TouchableOpacity
										key={route.uid}
										style={{
											flexDirection: 'row',
											backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc',
											borderBottomWidth: 1,
											borderBottomColor: '#f1f5f9',
											paddingVertical: 16,
										}}
										onPress={() => handleRowClick(route)}
								>
									<View style={{width: 200, paddingHorizontal: 12}}>
										<Text style={{
											color: '#374151', fontSize: 14,
										}}>
											{formatDate(route.dateFrom)} - {formatDate(route.dateTo)}
										</Text>
									</View>

									<View style={{width: 100, paddingHorizontal: 12}}>
										<Text style={{
											color: '#374151', fontSize: 14,
										}}>
											{route.truck?.registrationNumber || 'Nav pieejams'}
										</Text>
									</View>

									<View style={{width: 150, paddingHorizontal: 12}}>
										<Text style={{
											color: '#374151', fontSize: 14,
										}}>
											{[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Nav norādīts'}
										</Text>
									</View>

									<View style={{width: 120, paddingHorizontal: 12}}>
										<Text style={{
											color: '#3b82f6', fontWeight: '500', fontSize: 14,
										}}>
											{formatNumber(route.odometerAtRouteStart)} km
										</Text>
									</View>

									<View style={{width: 120, paddingHorizontal: 12}}>
										<Text style={{
											color: '#3b82f6', fontWeight: '500', fontSize: 14,
										}}>
											{formatNumber(route.odometerAtRouteFinish)} km
										</Text>
									</View>

									<View style={{width: 120, paddingHorizontal: 12}}>
										<Text style={{
											color: '#3b82f6', fontWeight: '500', fontSize: 14,
										}}>
											{formatNumber(route.computedTotalRoutesLength)} km
										</Text>
									</View>

									<View style={{width: 100, paddingHorizontal: 12}}>
										<Text style={{
											color: '#374151', fontSize: 14,
										}}>
											{formatNumber(route.fuelBalanceAtStart)} L
										</Text>
									</View>
									<View style={{width: 100, paddingHorizontal: 12}}>
										<Text style={{
											color: '#374151', fontSize: 14,
										}}>
											{formatNumber(route.fuelBalanceAtFinish)} L
										</Text>
									</View>
									<View style={{width: 120, paddingHorizontal: 12, justifyContent: 'center', flexDirection: 'row', gap: 8}}>
										<TouchableOpacity
												style={{
													backgroundColor: 'transparent',
													borderWidth: 1,
													borderColor: '#3b82f6',
													borderRadius: 6,
													paddingVertical: 4,
													paddingHorizontal: 8,
													alignItems: 'center',
												}}
												onPress={(e) => {
													e.stopPropagation()
													handleRowClick(route)
												}}
										>
											<Text style={{color: '#3b82f6', fontSize: 12}}>Skatīt</Text>
										</TouchableOpacity>
										
										{onDelete && (
											<TouchableOpacity
													style={{
														backgroundColor: 'transparent',
														borderWidth: 1,
														borderColor: '#dc2626',
														borderRadius: 6,
														paddingVertical: 4,
														paddingHorizontal: 8,
														alignItems: 'center',
														opacity: deletingRoute === route.uid ? 0.5 : 1,
													}}
													onPress={(e) => handleDeleteClick(route.uid, e)}
													disabled={deletingRoute === route.uid}
											>
												<Text style={{color: '#dc2626', fontSize: 12}}>
													{deletingRoute === route.uid ? 'Dzēš...' : 'Dzēst'}
												</Text>
											</TouchableOpacity>
										)}
									</View>
								</TouchableOpacity>))}
					</View>
				</ScrollView>

				{/* Pagination */}
				{totalPages > 1 && (<Pagination
								currentPage={currentPage}
								totalPages={totalPages}
								loading={false}
								onPageChange={handlePageChange}
						/>)}
			</View>)
}

export default RouteTable