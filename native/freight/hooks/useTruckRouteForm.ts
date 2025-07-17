import {TruckObjectDto} from '@/dto/TruckObjectDto'
import {TruckRouteDto} from '@/dto/TruckRouteDto'
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useObjectStore } from '@/hooks/useObjectStore';
import { format } from 'date-fns';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useOnlineStatus } from '@/hooks/useNetwork';
import { useTruckRoute } from '@/hooks/useTruckRoute';
import { FormState } from '@/types/truckRouteTypes';
import {
	getTrucks,
	getObjects,
	getLastActiveRoute,
	getLastFinishedRoute,
	checkRoutePageExists
} from '@/utils/offlineDataManager'
import { TruckRoutePageDto } from '@/dto/TruckRoutePageDto';

export function useTruckRouteForm(params: any) {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(() => !params?.newObject && !!params.id);
    const [hasCargo, setHasCargo] = useState(false);
    const [showRoutePageError, setShowRoutePageError] = useState(false);
    const [isItRouteFinish, setIsRouteFinish] = useState(false);
    const [existingRoutePage, setExistingRoutePage] = useState<TruckRoutePageDto | null>(null);
    const [outTruckObjectDetails, setOutTruckObjectDetails] = useState<TruckObjectDto | null>(null);
    const [inTruckObjectDetails, setInTruckObjectDetails] = useState<TruckObjectDto | null>(null);
    const [refreshDropdowns, setRefreshDropdowns] = useState(0);
    const [objectsList, setObjectsList] = useState<{id: string, name: string}[]>([]);
    const [selectedOutTruckObject, setSelectedOutTruckObject] = useState<string>('');
    const [selectedInTruckObject, setSelectedInTruckObject] = useState<string>('');
    const [form, setForm] = useState<FormState>({
        uid: '',
        routeDate: new Date(),
        outDateTime: new Date(),
        dateFrom: new Date(),
        dateTo: new Date(),
        routePageTruck: '',
        odometerAtStart: '',
        odometerAtFinish: '',
        outTruckObject: '',
        inTruckObject: '',
        cargoType: '',
        cargoVolume: '',
        unitType: '',
        fuelBalanceAtStart: '',
        fuelReceived: '',
        notes: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { newTruckObject, clearNewTruckObject, truckRouteForm, updateTruckRouteForm } = useObjectStore();
    const { startRoute, endRoute } = useTruckRoute();

    const fetchObjectsList = useCallback(async () => {
        try {
            const objects = await getObjects();
            const formattedOptions = objects.map(item => ({
                id: String(item.uid || item.id || item.server_id),
                name: String(item.name || item)
            }));
            setObjectsList(formattedOptions);
            console.log('Loaded objects using offline-first approach:', formattedOptions.length);
        } catch (error) {
            console.error('Failed to fetch objects list:', error);
        }
    }, []);

    const checkRoutePage = useCallback((() => {
        let timeoutId: NodeJS.Timeout;
        return async (truckId: string, date: Date) => {
            if (!truckId || !date) return;


            if (timeoutId) clearTimeout(timeoutId);

            timeoutId = setTimeout(async () => {
                try {
                    const formattedDate = format(date, 'yyyy-MM-dd');
                    // Use offline-first route page check
                    const routePage = await checkRoutePageExists(truckId, formattedDate);
                    if (routePage) {
                        setExistingRoutePage(routePage);
                        setShowRoutePageError(false);
                    } else {
                        setExistingRoutePage(null);
                        setShowRoutePageError(true);
                    }
                } catch (error: any) {
                    console.error('Failed to check route page:', error);
                    setExistingRoutePage(null);
                    setShowRoutePageError(true);
                }
            }, 300);
        };
    })(), []);

    useEffect(() => {
        // If there is saved data in store, use it
        if (truckRouteForm.outTruckObject && !selectedOutTruckObject) {
            setSelectedOutTruckObject(truckRouteForm.outTruckObject);
            setForm(prev => ({
                ...prev,
                outTruckObject: truckRouteForm.outTruckObject
            }));

            if (truckRouteForm.outTruckObjectName) {
                setOutTruckObjectDetails({
                    uid: truckRouteForm.outTruckObject,
                    name: truckRouteForm.outTruckObjectName
                });
            }
        }

        if (truckRouteForm.inTruckObject && !selectedInTruckObject && isItRouteFinish) {
            setSelectedInTruckObject(truckRouteForm.inTruckObject);
            setForm(prev => ({
                ...prev,
                inTruckObject: truckRouteForm.inTruckObject
            }));

            if (truckRouteForm.inTruckObjectName) {
                setInTruckObjectDetails({
                    uid: truckRouteForm.inTruckObject,
                    name: truckRouteForm.inTruckObjectName
                });
            }
        }
    }, []);

    // Update store when values change
    useEffect(() => {
        // Update store when values change
        if (selectedOutTruckObject || selectedInTruckObject) {
            updateTruckRouteForm({
                outTruckObject: selectedOutTruckObject,
                outTruckObjectName: outTruckObjectDetails?.name || '',
                inTruckObject: selectedInTruckObject,
                inTruckObjectName: inTruckObjectDetails?.name || ''
            });
        }
    }, [selectedOutTruckObject, selectedInTruckObject, outTruckObjectDetails, inTruckObjectDetails, updateTruckRouteForm]);

    useEffect(() => {
        if (newTruckObject) {
            setRefreshDropdowns(prev => prev + 1);

            if (newTruckObject.type === 'inTruckObject') {
                // Try to get UID from known fields
                const inUid = (typeof newTruckObject === 'object' && ('uid' in newTruckObject))
                    ? (newTruckObject as any).uid
                    : (newTruckObject.id || '');
                setSelectedInTruckObject(inUid);
                setForm(prev => ({ ...prev, inTruckObject: inUid }));
                setInTruckObjectDetails({ uid: inUid, name: newTruckObject.name });

                // Also update store
                updateTruckRouteForm({
                    inTruckObject: inUid,
                    inTruckObjectName: newTruckObject.name
                });
            } else if (newTruckObject.type === 'outTruckObject') {
                const outUid = (typeof newTruckObject === 'object' && ('uid' in newTruckObject))
                    ? (newTruckObject as any).uid
                    : (newTruckObject.id || '');
                setSelectedOutTruckObject(outUid);
                setForm(prev => ({ ...prev, outTruckObject: outUid }));
                setOutTruckObjectDetails({ uid: outUid, name: newTruckObject.name });

                // Also update store
                updateTruckRouteForm({
                    outTruckObject: outUid,
                    outTruckObjectName: newTruckObject.name
                });
            }
            clearNewTruckObject();
        }
    }, [newTruckObject, updateTruckRouteForm, clearNewTruckObject]);

    // Fetch objects list when refreshDropdowns changes
    useEffect(() => {
        fetchObjectsList();
    }, [refreshDropdowns, fetchObjectsList]);

    useEffect(() => {
        if (params.newObject === 'true') {
            setRefreshDropdowns(prev => prev + 1);

            // Use data from store, not from params
            if (truckRouteForm.outTruckObject) {
                const objectId = truckRouteForm.outTruckObject;
                const objectName = truckRouteForm.outTruckObjectName || '';

                setSelectedOutTruckObject(objectId);
                setForm(prev => ({
                    ...prev,
                    outTruckObject: objectId
                }));
                setOutTruckObjectDetails({ uid: objectId, name: objectName });

                setObjectsList(prev => {
                    const exists = prev.some(obj => obj.id === objectId);
                    if (!exists) return [...prev, { id: objectId, name: objectName }];
                    return prev;
                });
            }

            if (truckRouteForm.inTruckObject && isItRouteFinish) {
                const objectId = truckRouteForm.inTruckObject;
                const objectName = truckRouteForm.inTruckObjectName || '';

                setSelectedInTruckObject(objectId);
                setForm(prev => ({
                    ...prev,
                    inTruckObject: objectId
                }));
                setInTruckObjectDetails({ uid: objectId, name: objectName });

                setObjectsList(prev => {
                    const exists = prev.some(obj => obj.id === objectId);
                    if (!exists) return [...prev, { id: objectId, name: objectName }];
                    return prev;
                });
            }

            fetchObjectsList();
        }
    }, [params.newObject, truckRouteForm, fetchObjectsList]);

    useEffect(() => {
        // Skip initialization if we're handling a new object
        if (params.newObject === 'true') {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const initializeForm = async () => {
            try {
                try {
					const trucks = await getTrucks();
                    const lastActiveRoute = await getLastActiveRoute();

                    if (lastActiveRoute) {
						console.info("lastRoute")
                        setIsRouteFinish(true);

                        // Set hasCargo based on whether cargoVolume exists
                        setHasCargo(!!lastActiveRoute.cargoVolume);

                        // Convert dates from string to Date objects
                        const routeDate = lastActiveRoute.routeDate ? new Date(lastActiveRoute.routeDate) : new Date();
                        const outDateTime = lastActiveRoute.outDateTime ? new Date(lastActiveRoute.outDateTime) : new Date();

                        const outTruckObjectId = lastActiveRoute.outTruckObject?.uid?.toString() || '';
                        const inTruckObjectId = lastActiveRoute.inTruckObject?.uid?.toString() || '';

                        // Set the selected object state variables
                        setSelectedOutTruckObject(outTruckObjectId);
                        setSelectedInTruckObject(inTruckObjectId);

                        // Set the form state
                        setForm({
                            uid: lastActiveRoute.uid?.toString() || '',
                            routeDate,
                            outDateTime,
                            dateFrom: lastActiveRoute.truckRoutePage?.dateFrom ? new Date(lastActiveRoute.truckRoutePage.dateFrom) : new Date(),
                            dateTo: lastActiveRoute.truckRoutePage?.dateTo ? new Date(lastActiveRoute.truckRoutePage.dateTo) : new Date(),
                            routePageTruck: lastActiveRoute.truckRoutePage?.truck?.uid?.toString() || '',
                            odometerAtStart: lastActiveRoute.odometerAtStart?.toString() || '',
                            odometerAtFinish: lastActiveRoute.odometerAtFinish?.toString() || '',
                            outTruckObject: outTruckObjectId,
                            inTruckObject: inTruckObjectId,
                            cargoType: '',  // Not provided in the response
                            cargoVolume: lastActiveRoute.cargoVolume?.toString() || '',
                            unitType: lastActiveRoute.unitType || '',
                            fuelBalanceAtStart: lastActiveRoute.fuelBalanceAtStart?.toString() || '',
                            fuelReceived: lastActiveRoute.fuelReceived?.toString() || '',
                            notes: '',  // Not provided in the response
                        });

                        // Set the object details
                        if (lastActiveRoute.outTruckObject) {
                            setOutTruckObjectDetails(lastActiveRoute.outTruckObject);
                        }
                        if (lastActiveRoute.inTruckObject) {
                            setInTruckObjectDetails(lastActiveRoute.inTruckObject);
                        }

                        console.log('Loaded last active route using offline-first approach');
                    } else {
                        // No active route found
                        setIsRouteFinish(false);
                        
                        // Get last finished route for odometer value using offline-first approach
                        const lastFinishedRoute = await getLastFinishedRoute();

                        if (trucks && trucks.length > 0) {
                            const defaultTruck = trucks[0].uid?.toString() || '';
                            const currentDate = new Date();
                            const outTruckObjectId = lastFinishedRoute?.outTruckObject?.uid?.toString() || '';

                            // Set the selected object state variables
                            setSelectedOutTruckObject(outTruckObjectId);

                            // Set the form state
                            setForm(prev => ({
                                ...prev,
                                routeDate: currentDate,
                                routePageTruck: defaultTruck,
                                odometerAtStart: lastFinishedRoute?.odometerAtFinish?.toString() || '',
                                outTruckObject: outTruckObjectId,
                                fuelBalanceAtStart: lastFinishedRoute?.fuelBalanceAtFinish?.toString() || ''
                            }));

                            // Set the object details
                            if (lastFinishedRoute?.outTruckObject) {
                                setOutTruckObjectDetails(lastFinishedRoute.outTruckObject);
                            }

                            console.log('Loaded default truck and last finished route using offline-first approach');
                        }
                    }
                } catch (error) {
                    console.error('Failed to initialize form with offline-first data:', error);
                }
            } catch (error) {
                console.error('Failed to initialize form:', error);
            } finally {
                setIsLoading(false);
            }
        };
        initializeForm();
    }, [checkRoutePage, params.newObject]);

    // Check route page when either truck or date changes, but not on initial mount
    useEffect(() => {
        const isInitialMount = !form.routePageTruck;
        if (!isInitialMount) {
            checkRoutePage(form.routePageTruck, form.routeDate);
        }
    }, [form.routePageTruck, form.routeDate, checkRoutePage]);

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);

            // Helper functions for reusability
            const parseNumber = (value: string, defaultValue: number = 0): number => {
                const parsed = parseFloat(value);
                return isNaN(parsed) ? defaultValue : parsed;
            };

            const formatDateString = (date: Date | string): string => {
                const dateObj = date instanceof Date ? date : new Date(date);
                return format(dateObj, 'yyyy-MM-dd');
            };

            // Extract and validate form data once
            const formData = {
                outTruckObject: selectedOutTruckObject || form.outTruckObject,
                inTruckObject: selectedInTruckObject || form.inTruckObject,
                odometerStart: parseNumber(form.odometerAtStart),
                odometerFinish: parseNumber(form.odometerAtFinish),
                fuelBalanceAtStart: parseNumber(form.fuelBalanceAtStart),
                fuelReceived: parseNumber(form.fuelReceived),
                cargoVolume: parseNumber(form.cargoVolume),
            };

            // Calculate derived values
            const distanceKm = formData.odometerFinish - formData.odometerStart;
            const fuelConsumptionNorm = existingRoutePage?.truck?.fuelConsumptionNorm ?? 0;
            const fuelConsumed = (distanceKm * fuelConsumptionNorm) / 100;
            const fuelBalanceAtFinish = formData.fuelBalanceAtStart + formData.fuelReceived - fuelConsumed;

            // Simplified object creation
            const createTruckObject = (uid: string, details: any) => ({
                uid: uid || '',
                name: details?.name || ''
            });

            const truckRoutePage: TruckRoutePageDto = existingRoutePage || {
                uid: '',
                dateFrom: formatDateString(form.dateFrom),
                dateTo: formatDateString(form.dateTo),
                truck: { uid: form.routePageTruck || '0' },
                user: { id: user?.id || '0' },
                fuelBalanceAtStart: formData.fuelBalanceAtStart || null,
                odometerAtRouteStart: formData.odometerStart,
                odometerAtRouteFinish: formData.odometerFinish,
            };

            const now = new Date().toISOString();
            const payload: TruckRouteDto = {
                uid: form.uid,
                routeDate: formatDateString(form.routeDate),
                truckRoutePage: truckRoutePage,
                outTruckObject: createTruckObject(formData.outTruckObject, outTruckObjectDetails),
                inTruckObject: createTruckObject(formData.inTruckObject, inTruckObjectDetails),
                odometerAtStart: formData.odometerStart,
                odometerAtFinish: formData.odometerFinish,
                cargoVolume: hasCargo ? formData.cargoVolume : 0,
                unitType: hasCargo ? form.unitType : undefined,
                fuelBalanceAtStart: formData.fuelBalanceAtStart || existingRoutePage?.fuelBalanceAtStart || undefined,
                fuelReceived: formData.fuelReceived || undefined,
                fuelConsumed: fuelConsumed,
                fuelBalanceAtFinish: fuelBalanceAtFinish,
                outDateTime: now,
                inDateTime: formData.inTruckObject && isItRouteFinish ? now : undefined
            };

            // Simplified submission logic
            const mutation = isItRouteFinish ? endRoute : startRoute;
            await mutation.mutateAsync(payload);
            
            router.push('/(tabs)');
        } catch (error) {
            console.error('Failed to submit form:', error);
            
            Alert.alert(
                "Kļūda",
                "Neizdevās saglabāt brauciena datus!",
                [{ text: "OK" }]
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isLoading,
        hasCargo,
        setHasCargo,
        showRoutePageError,
        isItRouteFinish,
        existingRoutePage,
        outTruckObjectDetails,
        inTruckObjectDetails,
        refreshDropdowns,
        objectsList,
        selectedOutTruckObject,
        setSelectedOutTruckObject,
        selectedInTruckObject,
        setSelectedInTruckObject,
        form,
        setForm,
        isSubmitting,
        handleSubmit,
        checkRoutePage,
        fetchObjectsList
    };
}
