export interface TruckObject {
	// Backend API fields (uid-based)
	uid?: string;
	name?: string;
	
	// Legacy fields for backward compatibility
	id?: number;
}

export interface User {
	// Backend API fields (uid-based)
	uid?: string;
	preferred_username?: string;
	email?: string;
	given_name?: string;
	family_name?: string;
	attributes?: Record<string, string>;
	
	// Legacy fields for backward compatibility
	id?: string;
}

export interface Truck {
	// Backend API fields (uid-based)
	uid?: string;
	truckMaker?: string;
	truckModel?: string;
	registrationNumber?: string;
	fuelConsumptionNorm?: number;
	isDefault?: boolean;
	
	// Legacy fields for backward compatibility
	id?: number;
}

export interface TruckRoutePage {
	uid: string;
	id?: number;
	dateFrom: string;
	dateTo: string;
	truck: Truck;
	user: User;
	fuelBalanceAtStart: number | null;
	fuelBalanceAtFinish?: number;
	truckRegistrationNumber?: string;
	fuelConsumptionNorm?: number;
	totalFuelReceivedOnRoutes?: number;
	totalFuelConsumedOnRoutes?: number;
	fuelBalanceAtRoutesFinish?: number;
	odometerAtRouteStart?: number;
	odometerAtRouteFinish?: number;
	computedTotalRoutesLength?: number;
}

export interface TruckRouteDto {
	// Backend API fields (uid-based)
	uid?: string | null;
	routeDate: string;
	truckRoutePage: TruckRoutePage | null;
	outTruckObject: TruckObject | null;
	inTruckObject: TruckObject | null;
	odometerAtStart: number | null;
	odometerAtFinish: number | null;
	cargoVolume: number | null;
	unitType: string | null;
	fuelBalanceAtStart: number | null;
	fuelReceived: number | null;
	fuelBalanceAtFinish: number | null;
	outDateTime: string;
	inDateTime: string | null;
	
	// Legacy fields for backward compatibility
	id?: number | null;
}

export interface Page<T> {
	content: T[];
	totalPages: number;
	totalElements: number;
	size: number;
	number: number;
}

export interface FormState {
	id: string;
	routeDate: Date;
	outDateTime: Date;
	dateFrom: Date;
	dateTo: Date;
	routePageTruck: string;
	odometerAtStart: string;
	odometerAtFinish: string;
	outTruckObject: string;
	inTruckObject: string;
	cargoType: string; // Stores the ID as string for form handling
	cargoVolume: string;
	unitType: string; // Stores the code as string for form handling
	fuelBalanceAtStart: string;
	fuelReceived: string;
	notes: string;
}

// Tab navigācijas komponente
export interface TabNavigationProps {
	activeTab: 'basic' | 'odometer' | 'fuel';
	setActiveTab: (tab: 'basic' | 'odometer' | 'fuel') => void;
}

// Bāzes interfeiss visām tab komponentēm
export interface RouteTabBaseProps {
    isItRouteFinish: boolean;
    form: FormState;
    setForm: React.Dispatch<React.SetStateAction<FormState>>;
    hasCargo: boolean;
    setHasCargo: React.Dispatch<React.SetStateAction<boolean>>;
    showRoutePageError: boolean;
    selectedOutTruckObject: string;
    selectedInTruckObject: string;
    setSelectedOutTruckObject: React.Dispatch<React.SetStateAction<string>>;
    setSelectedInTruckObject: React.Dispatch<React.SetStateAction<string>>;
    outTruckObjectDetails: TruckObject | null;
    inTruckObjectDetails: TruckObject | null;
    refreshDropdowns: number;
    router: any;
    params?: any;
}

export interface RouteBasicTabProps extends RouteTabBaseProps {}

export interface RouteOdometerTabProps extends RouteTabBaseProps {}

export interface RouteFuelTabProps extends RouteTabBaseProps {}

export interface RouteInfoTabProps extends RouteTabBaseProps {}

export interface RouteAdditionalTabProps extends RouteTabBaseProps {}

export interface RouteTopSectionProps {
    form: FormState;
    setForm: React.Dispatch<React.SetStateAction<FormState>>;
    showRoutePageError: boolean;
}
