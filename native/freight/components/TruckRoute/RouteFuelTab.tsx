import React from 'react';
import { View } from 'react-native';
import { RouteFuelTabProps } from '@/types/truckRouteTypes';
import { styles } from './styles';
import FormInput from '../../components/FormInput';

const RouteFuelTab: React.FC<RouteFuelTabProps> = ({
    isItRouteFinish,
    form,
    setForm,
    showRoutePageError
}) => {
    if (isItRouteFinish) {
        // Kad isItRouteFinish=true, Fuel tabā rāda visus degvielas laukus
        return (
            <View style={[styles.tabContentContainer, styles.fuelTabContent]}>
                <FormInput
                    label="Degvielas atlikums"
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
    
    // Kad isItRouteFinish=false, Fuel tabā rāda degvielu startā un saņemto degvielu
    return (
        <View style={[styles.tabContentContainer, styles.fuelTabContent]}>
            <FormInput
                label="Degvielas atlikums"
                value={form.fuelBalanceAtStart}
                onChangeText={(text) => {
                    // Allow only numbers
                    if (/^\d*$/.test(text)) {
                        setForm({...form, fuelBalanceAtStart: text})
                    }
                }}
                placeholder="Ievadiet degvielas daudzumu"
                keyboardType="numeric"
                disabled={!showRoutePageError}
                visible={true}
                error={showRoutePageError && !form.fuelBalanceAtStart ? 'Ievadiet datus!' : undefined}
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
};

export default RouteFuelTab;
