export interface TruckObject {
	id: number;
	name?: string;
}

export interface User {
	id: string;
	preferred_username?: string;
	email?: string;
	given_name?: string;
	family_name?: string;
	attributes?: Record<string, string>;
}

export interface Truck {
	id: number;
	truckMaker?: string;
	truckModel?: string;
	registrationNumber?: string;
	fuelConsumptionNorm?: number;
	isDefault?: boolean;
}

export interface TruckRoutePage {
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
	id: number | null;
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
	activeTab: number;
	setActiveTab: (tab: number) => void;
}

export interface RouteInfoTabProps {
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

export interface RouteAdditionalTabProps {
    isItRouteFinish: boolean;
    form: FormState;
    setForm: React.Dispatch<React.SetStateAction<FormState>>;
    hasCargo: boolean;
    setHasCargo: React.Dispatch<React.SetStateAction<boolean>>;
    selectedOutTruckObject: string;
    selectedInTruckObject: string;
    setSelectedOutTruckObject: React.Dispatch<React.SetStateAction<string>>;
    setSelectedInTruckObject: React.Dispatch<React.SetStateAction<string>>;
    outTruckObjectDetails: TruckObject | null;
    refreshDropdowns: number;
}

export interface RouteTopSectionProps {
    form: FormState;
    setForm: React.Dispatch<React.SetStateAction<FormState>>;
    showRoutePageError: boolean;
}
