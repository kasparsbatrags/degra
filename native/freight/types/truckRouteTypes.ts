import {TruckObjectDto} from '@/dto/TruckObjectDto'

export interface Page<T> {
	content: T[];
	totalPages: number;
	totalElements: number;
	size: number;
	number: number;
}

export interface FormState {
	uid: string;
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
    outTruckObjectDetails: TruckObjectDto | null;
    inTruckObjectDetails: TruckObjectDto | null;
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
