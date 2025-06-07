import React from 'react';
import { View, Switch, Text } from 'react-native';
import { commonStyles } from '@/constants/styles';
import { COLORS } from '@/constants/theme';
import { RouteBasicTabProps } from '@/types/truckRouteTypes';
import { styles } from './styles';
import FormDatePicker from '../../components/FormDatePicker';
import ImprovedFormDropdownOffline from '../../components/ImprovedFormDropdownOffline';
import ImprovedFormDropdownWithAddButtonOffline from '../../components/ImprovedFormDropdownWithAddButtonOffline';

const RouteBasicTab: React.FC<RouteBasicTabProps> = ({
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
    // Kad isItRouteFinish=true, Basic tabā rāda datumu un galamērķi
    return (
        <View style={[styles.tabContentContainer, styles.basicTabContent]}>
            <View style={commonStyles.row}>
                <FormDatePicker
                    label="Datums"
                    value={form.routeDate}
                    onChange={(date) => setForm({...form, routeDate: date})}
                    disabled={isItRouteFinish}
                />
            </View>
            
            <ImprovedFormDropdownWithAddButtonOffline
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
            </View>
        );
    }
    
    // Kad isItRouteFinish=false, Basic tabā rāda aktīvos laukus
    return (
        <View style={[styles.tabContentContainer, styles.basicTabContent]}>
            <View style={commonStyles.row}>
                <FormDatePicker
                    label="Datums"
                    value={form.routeDate}
                    onChange={(date) => setForm({...form, routeDate: date})}
                    disabled={isItRouteFinish}
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
                </View>
            )}
            <View style={styles.truckField}>
                <ImprovedFormDropdownOffline
                    label="Auto"
                    value={form.routePageTruck}
                    onSelect={(value: string) => setForm({...form, routePageTruck: value})}
                    placeholder="Izvēlieties"
                    endpoint="/trucks"
                    disabled={isItRouteFinish}
                    error={!form.routePageTruck ? 'Ievadiet datus!' : undefined}
                />
            </View>

            <ImprovedFormDropdownWithAddButtonOffline
                label="Starts no..."
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

            <ImprovedFormDropdownWithAddButtonOffline
                label="Finišs..."
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

            {/*<View style={commonStyles.spaceBetween}>*/}
            {/*    <Text style={commonStyles.text}>Ar kravu</Text>*/}
            {/*    <Switch*/}
            {/*        value={hasCargo}*/}
            {/*        onValueChange={setHasCargo}*/}
            {/*        trackColor={{false: COLORS.black100, true: COLORS.secondary}}*/}
            {/*        thumbColor={COLORS.white}*/}
            {/*    />*/}
            {/*</View>*/}
        </View>
    );
};

export default RouteBasicTab;
