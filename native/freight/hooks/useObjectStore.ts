import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TruckRouteForm {
	outTruckObject: string;
	outTruckObjectName: string;
	inTruckObject: string;
	inTruckObjectName: string;
}

interface ObjectState {
	newTruckObject?: {
		id: string;
		name: string;
		type: 'inTruckObject' | 'outTruckObject';
	};
	truckRouteForm: TruckRouteForm;
	setNewTruckObject: (data: ObjectState['newTruckObject']) => void;
	clearNewTruckObject: () => void;
	updateTruckRouteForm: (updates: Partial<TruckRouteForm>) => void;
	resetTruckRouteForm: () => void;
}

// Initial state for the form
const initialTruckRouteForm: TruckRouteForm = {
	outTruckObject: '',
	outTruckObjectName: '',
	inTruckObject: '',
	inTruckObjectName: '',
};

export const useObjectStore = create<ObjectState>()(
	persist(
		(set) => ({
			newTruckObject: undefined,
			truckRouteForm: initialTruckRouteForm,
			setNewTruckObject: (data) => set({ newTruckObject: data }),
			clearNewTruckObject: () => set({ newTruckObject: undefined }),
			updateTruckRouteForm: (updates) => set((state) => ({
				truckRouteForm: { ...state.truckRouteForm, ...updates }
			})),
			resetTruckRouteForm: () => set({ truckRouteForm: initialTruckRouteForm }),
		}),
		{
			name: 'object-store',
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
);
