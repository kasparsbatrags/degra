import React from 'react';
import { Text, View } from 'react-native';
import { commonStyles } from '@/constants/styles';
import { RouteTopSectionProps } from '@/types/truckRouteTypes';
import { styles } from './styles';
import FormDatePicker from '../../components/FormDatePicker';
import FormInput from '../../components/FormInput';

const RouteTopSection: React.FC<RouteTopSectionProps> = ({ form, setForm, showRoutePageError }) => {
    return (
        <View id="top" style={[styles.topContainer]}>
            <View style={commonStyles.row}>
                <FormDatePicker
                    label="Datums"
                    value={form.routeDate}
                    onChange={(date) => setForm({...form, routeDate: date})}
                    // disabled={isItRouteFinish}
                />
            </View>

            {showRoutePageError && (
                <View style={[styles.topContainer, showRoutePageError && styles.errorBorder]}>
                    <Text style={styles.explanatoryText}>
                        Nav izveidota maršruta lapa izvēlētā datuma periodam - pievienojiet informāciju
                        tās izveidošanai!
                    </Text>

                    <View style={commonStyles.row}>
                        <FormDatePicker
                            label="Sākums"
                            value={form.dateFrom}
                            onChange={(date) => setForm({...form, dateFrom: date})}
                            error="Lauks ir obligāts"
                            showError={showRoutePageError && !form.dateFrom}
                        />
                        <FormDatePicker
                            label="Beigas"
                            value={form.dateTo}
                            onChange={(date) => setForm({...form, dateTo: date})}
                            error="Lauks ir obligāts"
                            showError={showRoutePageError && !form.dateTo}
                        />
                    </View>

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
                        error={showRoutePageError && !form.fuelBalanceAtStart ? 'Ievadiet datus!' : undefined}
                    />

                    <FormInput
                        label="Odometrs"
                        value={form.odometerAtStart}
                        onChangeText={(text) => {
                            // Allow only numbers
                            if (/^\d*$/.test(text) && text !== '0') {
                                setForm({...form, odometerAtStart: text})
                            }
                        }}
                        placeholder="Ievadiet rādījumu"
                        keyboardType="numeric"
                        error={showRoutePageError && !form.odometerAtStart ? 'Ievadiet datus!' : undefined}
                    />
                </View>
            )}
        </View>
    );
};

export default RouteTopSection;
