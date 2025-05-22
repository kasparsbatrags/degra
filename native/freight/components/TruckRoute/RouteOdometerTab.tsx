import React from 'react';
import { View } from 'react-native';
import { RouteOdometerTabProps } from '@/types/truckRouteTypes';
import { styles } from './styles';
import FormInput from '../../components/FormInput';

const RouteOdometerTab: React.FC<RouteOdometerTabProps> = ({
    isItRouteFinish,
    form,
    setForm,
    showRoutePageError
}) => {
    if (isItRouteFinish) {
        // Kad isItRouteFinish=true, Odometer tabā rāda odometru finišā
        return (
            <View style={[styles.tabContentContainer, styles.odometerTabContent]}>
                <FormInput
                    label="Odometrs startā"
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

                <FormInput
                    label="Odometrs finišā"
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
            </View>
        );
    }
    
    // Kad isItRouteFinish=false, Odometer tabā rāda odometru startā
    return (
        <View style={[styles.tabContentContainer, styles.odometerTabContent]}>
            <FormInput
                label="Odometrs startā"
                value={form.odometerAtStart}
                onChangeText={(text) => {
                    // Allow only numbers
                    if (/^\d*$/.test(text) && text !== '0') {
                        setForm({...form, odometerAtStart: text})
                    }
                }}
                placeholder="Ievadiet rādījumu"
                keyboardType="numeric"
                visible={true}
                disabled={!showRoutePageError}
                error={showRoutePageError && !form.odometerAtStart ? 'Ievadiet datus!' : !showRoutePageError && !form.odometerAtStart ? 'Ievadiet datus!' : undefined}
            />
        </View>
    );
};

export default RouteOdometerTab;
