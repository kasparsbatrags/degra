import React from 'react';
import { View, Switch, Text } from 'react-native';
import { commonStyles } from '@/constants/styles';
import { COLORS } from '@/constants/theme';
import { RouteAdditionalTabProps } from '@/types/truckRouteTypes';
import { styles } from './styles';
import FormInput from '../../components/FormInput';
import ImprovedFormDropdown from '../../components/ImprovedFormDropdown';
import ImprovedFormDropdownWithAddButton from '../../components/ImprovedFormDropdownWithAddButton';

const RouteAdditionalTab: React.FC<RouteAdditionalTabProps> = ({
    isItRouteFinish,
    form,
    setForm,
    hasCargo,
    setHasCargo,
    selectedOutTruckObject,
    selectedInTruckObject,
    setSelectedOutTruckObject,
    setSelectedInTruckObject,
    outTruckObjectDetails,
    refreshDropdowns
}) => {
    if (isItRouteFinish) {
        // Kad isItRouteFinish=true, Papildus tabā rāda neaktīvos laukus
        return (
            <View style={[styles.tabContentContainer, styles.additionalTabContent]}>
                <View style={styles.truckField}>
                    <ImprovedFormDropdown
                        label="Auto"
                        value={form.routePageTruck}
                        onSelect={(value: string) => setForm({...form, routePageTruck: value})}
                        placeholder="Izvēlieties"
                        endpoint="/trucks"
                        disabled={true}
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
                            disabled={true}
                            visible={true}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <FormInput
                            label="Degvielas atlikums sākumā"
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
                            visible={true}
                        />
                    </View>
                </View>

                <ImprovedFormDropdownWithAddButton
                    label="Starts no..."
                    value={selectedOutTruckObject || form.outTruckObject}
                    onSelect={(value: string) => {
                        setSelectedOutTruckObject(value);
                        setForm(prev => ({...prev, outTruckObject: value}));
                    }}
                    placeholder="Izvēlieties sākuma punktu"
                    endpoint="/objects"
                    disabled={true}
                    forceRefresh={refreshDropdowns}
                    objectName={outTruckObjectDetails?.name}
                    onAddPress={() => {}} // Tukša funkcija, jo disabled=true
                />

                {hasCargo && (
                    <>
                        <View style={commonStyles.spaceBetween}>
                            <Text style={commonStyles.text}>Ar kravu</Text>
                            <Switch
                                value={hasCargo}
                                onValueChange={setHasCargo}
                                trackColor={{false: COLORS.black100, true: COLORS.secondary}}
                                thumbColor={COLORS.white}
                                disabled={true}
                            />
                        </View>

                        <ImprovedFormDropdown
                            label="Kravas tips"
                            value={form.cargoType}
                            onSelect={(value: string) => setForm({...form, cargoType: value})}
                            placeholder=" Izvēlieties"
                            endpoint="api/freight/cargo-types"
                            disabled={true}
                        />

                        <FormInput
                            label="Kravas apjoms"
                            value={form.cargoVolume}
                            onChangeText={(text) => setForm({...form, cargoVolume: text})}
                            placeholder="Ievadiet kravas apjomu"
                            keyboardType="numeric"
                            disabled={true}
                        />

                        <ImprovedFormDropdown
                            label="Mērvienība"
                            value={form.unitType}
                            onSelect={(value: string) => setForm({...form, unitType: value})}
                            placeholder="Izvēlieties mērvienību"
                            endpoint="/unit-types"
                            disabled={true}
                        />
                    </>
                )}
            </View>
        );
    }
    
    // Kad isItRouteFinish=false, Papildus tabā rāda kravas informāciju un saņemto degvielu
    return (
        <View style={[styles.tabContentContainer, styles.additionalTabContent]}>
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

            {hasCargo && (
                <>
                    <ImprovedFormDropdown
                        label="Kravas tips"
                        value={form.cargoType}
                        onSelect={(value: string) => setForm({...form, cargoType: value})}
                        placeholder=" Izvēlieties"
                        endpoint="api/freight/cargo-types"
                    />

                    <FormInput
                        label="Kravas apjoms"
                        value={form.cargoVolume}
                        onChangeText={(text) => setForm({...form, cargoVolume: text})}
                        placeholder="Ievadiet kravas apjomu"
                        keyboardType="numeric"
                    />

                    <ImprovedFormDropdown
                        label="Mērvienība"
                        value={form.unitType}
                        onSelect={(value: string) => setForm({...form, unitType: value})}
                        placeholder="Izvēlieties mērvienību"
                        endpoint="/unit-types"
                    />
                </>
            )}
        </View>
    );
};

export default RouteAdditionalTab;
