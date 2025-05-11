import { create } from 'zustand';

interface ObjectState {
	newTruckObject?: {
		id: string;
		name: string;
		type: 'inTruckObject' | 'outTruckObject';
	};
	setNewTruckObject: (data: ObjectState['newTruckObject']) => void;
	clearNewTruckObject: () => void;
}

export const useObjectStore = create<ObjectState>((set) => ({
	newTruckObject: undefined,
	setNewTruckObject: (data) => set({ newTruckObject: data }),
	clearNewTruckObject: () => set({ newTruckObject: undefined }),
}));
