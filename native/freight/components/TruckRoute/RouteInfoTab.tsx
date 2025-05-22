import React from 'react';
import { View, Switch, Text } from 'react-native';
import { commonStyles } from '@/constants/styles';
import { COLORS } from '@/constants/theme';
import { RouteInfoTabProps } from '@/types/truckRouteTypes';
import { styles } from './styles';
import FormInput from '../../components/FormInput';
import ImprovedFormDropdown from '../../components/ImprovedFormDropdown';
import ImprovedFormDropdownWithAddButton from '../../components/ImprovedFormDropdownWithAddButton';

const RouteInfoTab: React.FC<RouteInfoTabProps> = ({
    isItRouteFinish,
    form,
    setForm,
    hasCargo,
    setHasCargo,
    showRoutePageError,
    selectedOutTruckObject,
    selectedInTruckObject,
    setSelectedOutTruckObject,
    setSelectedInTruckObject,
    outTruckObjectDetails,
    inTruckObjectDetails,
    refreshDropdowns,
    router,
    params
}) => {
    if (isItRouteFinish) {
        // Kad isItRouteFinish=true, Info tabā rāda odometru finišā un saņemto degvielu
        return (
            <View style={[styles.tabContentContainer, styles.infoTabContent]}>
                <ImprovedFormDropdownWithAddButton
                    label="Ierados"
                    value={selectedInTruckObject || form.inTruckObject}
                    onSelect={(value: string) => {
                        setSelectedInTruckObject(value);
                        setForm(prev => ({...prev, inTruckObject: value}));
                    }}
                    placeholder="Ievadiet galamērķi"
                    endpoint="/objects"
                    error={isItRouteFinish && !selectedInTruckObject && !form.inTruckObject ? 'Ievadiet datus!' : undefined}
                    forceRefresh={refreshDropdowns}
                    objectName={inTruckObjectDetails?.name || params?.inTruckObjectName || ''}
                    onAddPress={() => router.push({
                        pathname: '/add-truck-object',
                        params: { type: 'inTruckObject' }
                    })}
                />

                <FormInput
                    label="Odometrs"
                    value={form.odometerAtFinish}
                    onChangeText={(text) => {
                        // Allow only numbers
                        if (/^\d*$/.test(text)) {
                            setForm({...form, odometerAtFinish: text})
                        }
                    }}
                    placeholder="Ievadiet rādījumu"
                    keyboardType="numeric"
                    error={!showRoutePageError && (!form.odometerAtFinish || (parseInt(form.odometerAtFinish, 10) <= parseInt(form.odometerAtStart, 10))) ? 'Ievadiet datus!' : undefined}
                />

                <FormInput
                    label="Saņemtā degviela"
                    value={form.fuelReceived}
                    onChangeText={(text) => {
                        // Allow only numbers
                        if (/^\d*$/.test(text)) {
                            setForm({...form, fuelReceived: text})
                        }
                    }}
                    placeholder="Ievadiet daudzumu"
                    keyboardType="numeric"
                />
            </View>
        );
    }
    
    // Kad isItRouteFinish=false, Info tabā rāda aktīvos laukus
    return (
        <View style={[styles.tabContentContainer, styles.infoTabContent]}>
            <View style={styles.truckField}>
                <ImprovedFormDropdown
                    label="Auto"
                    value={form.routePageTruck}
                    onSelect={(value: string) => setForm({...form, routePageTruck: value})}
                    placeholder="Izvēlieties"
                    endpoint="/trucks"
                    disabled={isItRouteFinish}
                    error={!form.routePageTruck ? 'Ievadiet datus!' : undefined}
                />
            </View>
            
            <View id="atStart" style={[commonStyles.row, styles.atStartContainer]}>
                <View style={styles.inputWrapper}>
                    <FormInput
                        label="Odometrs"
                        value={form.odometerAtStart}
                        onChangeText={(text) => {
                            // Allow only numbers
                            if (/^\d*$/.test(text)) {
                                setForm({...form, odometerAtStart: text})
                            }
                        }}
                        placeholder="Ievadiet rādījumu"
                        keyboardType="numeric"
                        visible={!showRoutePageError}
                        error={!showRoutePageError && !form.odometerAtStart ? 'Ievadiet datus!' : undefined}
                    />
                </View>

                <View style={styles.inputWrapper}>
                    <FormInput
                        label="Degviela startā"
                        value={form.fuelBalanceAtStart}
                        onChangeText={(text) => {
                            // Allow only numbers
                            if (/^\d*$/.test(text)) {
                                setForm({...form, fuelBalanceAtStart: text})
                            }
                        }}
                        placeholder="Ievadiet degvielas daudzumu"
                        keyboardType="numeric"
                        disabled={true}
                        visible={!showRoutePageError}
                        error={showRoutePageError && !form.fuelBalanceAtStart ? 'Ievadiet datus!' : undefined}
                    />
                </View>
            </View>

            <ImprovedFormDropdownWithAddButton
                label="Starts"
                value={selectedOutTruckObject || form.outTruckObject}
                onSelect={(value: string) => {
                    setSelectedOutTruckObject(value);
                    setForm(prev => ({...prev, outTruckObject: value}));
                }}
                placeholder="Izvēlieties sākuma punktu"
                endpoint="/objects"
                error={!selectedOutTruckObject && !form.outTruckObject ? 'Ievadiet datus!' : undefined}
                onAddPress={() => router.push({
                    pathname: '/add-truck-object',
                    params: { type: 'outTruckObject' }
                })}
                forceRefresh={refreshDropdowns}
                objectName={outTruckObjectDetails?.name}
            />

            <ImprovedFormDropdownWithAddButton
                label="Finišs"
                value={selectedInTruckObject || form.inTruckObject}
                onSelect={(value: string) => {
                    setSelectedInTruckObject(value);
                    setForm(prev => ({...prev, inTruckObject: value}));
                }}
                placeholder="Ievadiet galamērķi"
                endpoint="/objects"
                error={isItRouteFinish && !selectedInTruckObject && !form.inTruckObject ? 'Ievadiet datus!' : undefined}
                onAddPress={() => router.push({
                    pathname: '/add-truck-object',
                    params: { type: 'inTruckObject' }
                })}
                forceRefresh={refreshDropdowns}
                objectName={inTruckObjectDetails?.name || params?.inTruckObjectName || ''}
            />

            <View style={commonStyles.spaceBetween}>
                <Text style={commonStyles.text}>Ar kravu</Text>
                <Switch
                    value={hasCargo}
                    onValueChange={setHasCargo}
                    trackColor={{false: COLORS.black100, true: COLORS.secondary}}
                    thumbColor={COLORS.white}
                />
            </View>
        </View>
    );
};

export default RouteInfoTab;
