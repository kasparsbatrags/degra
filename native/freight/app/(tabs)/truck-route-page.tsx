import {router, useLocalSearchParams} from 'expo-router'
import React, {useEffect, useState} from 'react'
import {ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import Button from '../../components/Button'
import FormInput from '../../components/FormInput'
import freightAxios from '../../config/freightAxios'
import {COLORS, CONTAINER_WIDTH, FONT} from '../../constants/theme'

interface TruckRoutePageForm {
  dateFrom: Date;
  dateTo: Date;
  truckRegistrationNumber: string;
  fuelConsumptionNorm: string;
  fuelBalanceAtStart: string;
  fuelBalanceAtEnd: string;
}

export default function TruckRoutePageScreen() {
  const {id} = useLocalSearchParams<{id: string}>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  const [isEditMode, setIsEditMode] = useState(!id);
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);
  const [form, setForm] = useState<TruckRoutePageForm>({
    dateFrom: new Date(),
    dateTo: new Date(),
    truckRegistrationNumber: '',
    fuelConsumptionNorm: '',
    fuelBalanceAtStart: '',
    fuelBalanceAtEnd: '',
  });

  useEffect(() => {
    if (id) {
      fetchRouteDetails();
    }
  }, [id]);

  const fetchRouteDetails = async () => {
    try {
      const response = await freightAxios.get(`/api/freight-tracking/route-pages/${id}`);
      const routeData = response.data;
      
      setForm({
        dateFrom: new Date(routeData.dateFrom),
        dateTo: new Date(routeData.dateTo),
        truckRegistrationNumber: routeData.truckRegistrationNumber,
        fuelConsumptionNorm: routeData.fuelConsumptionNorm.toString(),
        fuelBalanceAtStart: routeData.fuelBalanceAtStart.toString(),
        fuelBalanceAtEnd: routeData.fuelBalanceAtEnd?.toString() ?? '',
      });
    } catch (error) {
      console.error('Failed to fetch route details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const payload = {
        dateFrom: form.dateFrom.toISOString().split('T')[0],
        dateTo: form.dateTo.toISOString().split('T')[0],
        truckRegistrationNumber: form.truckRegistrationNumber,
        fuelConsumptionNorm: parseFloat(form.fuelConsumptionNorm),
        fuelBalanceAtStart: parseFloat(form.fuelBalanceAtStart),
        fuelBalanceAtEnd: form.fuelBalanceAtEnd ? parseFloat(form.fuelBalanceAtEnd) : null,
      };

      if (id) {
        await freightAxios.put(`/api/freight-tracking/route-pages/${id}`, payload);
      } else {
        await freightAxios.post('/api/freight-tracking/route-pages', payload);
      }
      router.push('/(tabs)');
    } catch (error) {
      console.error('Failed to submit form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.title}>
            {id ? (isEditMode ? 'Rediģēt maršruta lapu' : 'Maršruta lapa') : 'Pievienot maršruta lapu'}
          </Text>

          {id && !isEditMode && (
            <Button
              title="Rediģēt"
              onPress={() => setIsEditMode(true)}
              style={styles.editButton}
            />
          )}

          <View style={[styles.dateContainer, styles.dateSection]}>
            <Text style={styles.label}>Datums no</Text>
            <TouchableOpacity 
              style={[styles.dateButton, !isEditMode && styles.disabled]}
              onPress={() => isEditMode && setShowDateFromPicker(true)}
              disabled={!isEditMode}
            >
              <Text style={styles.dateText}>
                {form.dateFrom.toLocaleDateString('lv-LV')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateContainer}>
            <Text style={styles.label}>Datums līdz</Text>
            <TouchableOpacity 
              style={[styles.dateButton, !isEditMode && styles.disabled]}
              onPress={() => isEditMode && setShowDateToPicker(true)}
              disabled={!isEditMode}
            >
              <Text style={styles.dateText}>
                {form.dateTo.toLocaleDateString('lv-LV')}
              </Text>
            </TouchableOpacity>
          </View>

          {showDateFromPicker && (
            <Modal
              transparent={true}
              visible={showDateFromPicker}
              animationType="fade"
              onRequestClose={() => setShowDateFromPicker(false)}
            >
              <Pressable 
                style={styles.modalOverlay}
                onPress={() => setShowDateFromPicker(false)}
              >
                <Pressable 
                  style={styles.modalContent}
                  onPress={(e) => e.stopPropagation()}
                >
                  <View style={styles.calendarHeader}>
                    <TouchableOpacity
                      style={styles.monthButton}
                      onPress={() => {
                        const newDate = new Date(form.dateFrom);
                        newDate.setMonth(newDate.getMonth() - 1);
                        setForm({...form, dateFrom: newDate});
                      }}
                    >
                      <Text style={styles.monthButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.monthYearText}>
                      {form.dateFrom.toLocaleDateString('lv-LV', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Text>
                    <TouchableOpacity
                      style={styles.monthButton}
                      onPress={() => {
                        const newDate = new Date(form.dateFrom);
                        newDate.setMonth(newDate.getMonth() + 1);
                        setForm({...form, dateFrom: newDate});
                      }}
                    >
                      <Text style={styles.monthButtonText}>→</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.weekDaysRow}>
                    {Array.from({length: 7}).map((_, i) => (
                      <Text key={i} style={styles.weekDayText}>
                        {new Date(2024, 0, i + 1).toLocaleDateString('lv-LV', {weekday: 'short'})}
                      </Text>
                    ))}
                  </View>
                  <View style={styles.daysGrid}>
                    {(() => {
                      const year = form.dateFrom.getFullYear();
                      const month = form.dateFrom.getMonth();
                      const firstDay = new Date(year, month, 1);
                      const lastDay = new Date(year, month + 1, 0);
                      const startingDay = firstDay.getDay();
                      const totalDays = lastDay.getDate();
                      
                      const days = [];
                      for (let i = 0; i < startingDay; i++) {
                        days.push(<View key={`empty-${i}`} style={styles.dayButton} />);
                      }
                      
                      for (let i = 1; i <= totalDays; i++) {
                        const date = new Date(year, month, i);
                        const isSelected = date.toDateString() === form.dateFrom.toDateString();
                        const isToday = date.toDateString() === new Date().toDateString();
                        
                        days.push(
                          <Pressable
                            key={i}
                            style={[
                              styles.dayButton,
                              isSelected && styles.selectedDay,
                              isToday && styles.todayDay
                            ]}
                            onPress={() => {
                              setForm({...form, dateFrom: date});
                              setShowDateFromPicker(false);
                            }}
                          >
                            <Text style={[
                              styles.dayText,
                              isSelected && styles.selectedDayText,
                              isToday && styles.todayDayText
                            ]}>
                              {i}
                            </Text>
                          </Pressable>
                        );
                      }
                      
                      return days;
                    })()}
                  </View>
                </Pressable>
              </Pressable>
            </Modal>
          )}

          {showDateToPicker && (
            <Modal
              transparent={true}
              visible={showDateToPicker}
              animationType="fade"
              onRequestClose={() => setShowDateToPicker(false)}
            >
              <Pressable 
                style={styles.modalOverlay}
                onPress={() => setShowDateToPicker(false)}
              >
                <Pressable 
                  style={styles.modalContent}
                  onPress={(e) => e.stopPropagation()}
                >
                  <View style={styles.calendarHeader}>
                    <TouchableOpacity
                      style={styles.monthButton}
                      onPress={() => {
                        const newDate = new Date(form.dateTo);
                        newDate.setMonth(newDate.getMonth() - 1);
                        setForm({...form, dateTo: newDate});
                      }}
                    >
                      <Text style={styles.monthButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.monthYearText}>
                      {form.dateTo.toLocaleDateString('lv-LV', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Text>
                    <TouchableOpacity
                      style={styles.monthButton}
                      onPress={() => {
                        const newDate = new Date(form.dateTo);
                        newDate.setMonth(newDate.getMonth() + 1);
                        setForm({...form, dateTo: newDate});
                      }}
                    >
                      <Text style={styles.monthButtonText}>→</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.weekDaysRow}>
                    {Array.from({length: 7}).map((_, i) => (
                      <Text key={i} style={styles.weekDayText}>
                        {new Date(2024, 0, i + 1).toLocaleDateString('lv-LV', {weekday: 'short'})}
                      </Text>
                    ))}
                  </View>
                  <View style={styles.daysGrid}>
                    {(() => {
                      const year = form.dateTo.getFullYear();
                      const month = form.dateTo.getMonth();
                      const firstDay = new Date(year, month, 1);
                      const lastDay = new Date(year, month + 1, 0);
                      const startingDay = firstDay.getDay();
                      const totalDays = lastDay.getDate();
                      
                      const days = [];
                      for (let i = 0; i < startingDay; i++) {
                        days.push(<View key={`empty-${i}`} style={styles.dayButton} />);
                      }
                      
                      for (let i = 1; i <= totalDays; i++) {
                        const date = new Date(year, month, i);
                        const isSelected = date.toDateString() === form.dateTo.toDateString();
                        const isToday = date.toDateString() === new Date().toDateString();
                        
                        days.push(
                          <Pressable
                            key={i}
                            style={[
                              styles.dayButton,
                              isSelected && styles.selectedDay,
                              isToday && styles.todayDay
                            ]}
                            onPress={() => {
                              setForm({...form, dateTo: date});
                              setShowDateToPicker(false);
                            }}
                          >
                            <Text style={[
                              styles.dayText,
                              isSelected && styles.selectedDayText,
                              isToday && styles.todayDayText
                            ]}>
                              {i}
                            </Text>
                          </Pressable>
                        );
                      }
                      
                      return days;
                    })()}
                  </View>
                </Pressable>
              </Pressable>
            </Modal>
          )}

          <FormInput
            label="Auto reģistrācijas numurs"
            value={form.truckRegistrationNumber}
            onChangeText={(text) => isEditMode && setForm({...form, truckRegistrationNumber: text})}
            placeholder="Ievadiet auto reģistrācijas numuru"
            editable={isEditMode}
          />

          <FormInput
            label="Degvielas patēriņa norma"
            value={form.fuelConsumptionNorm}
            onChangeText={(text) => {
              if (isEditMode && /^\d*\.?\d*$/.test(text)) {
                setForm({...form, fuelConsumptionNorm: text})
              }
            }}
            placeholder="Ievadiet degvielas patēriņa normu"
            keyboardType="numeric"
            editable={isEditMode}
          />

          <FormInput
            label="Degvielas atlikums sākumā"
            value={form.fuelBalanceAtStart}
            onChangeText={(text) => {
              if (isEditMode && /^\d*\.?\d*$/.test(text)) {
                setForm({...form, fuelBalanceAtStart: text})
              }
            }}
            placeholder="Ievadiet degvielas atlikumu"
            keyboardType="numeric"
            editable={isEditMode}
          />

          <FormInput
            label="Degvielas atlikums beigās"
            value={form.fuelBalanceAtEnd}
            onChangeText={(text) => {
              if (isEditMode && /^\d*\.?\d*$/.test(text)) {
                setForm({...form, fuelBalanceAtEnd: text})
              }
            }}
            placeholder="Ievadiet degvielas atlikumu"
            keyboardType="numeric"
            editable={isEditMode}
          />

          <View style={styles.buttonContainer}>
            <Button
              title="Atpakaļ"
              onPress={() => router.push('/(tabs)')}
              style={styles.backButton}
            />
            {isEditMode && (
              <Button
                title={id ? "Saglabāt" : "Pievienot"}
                onPress={handleSubmit}
                style={styles.submitButton}
                disabled={isSubmitting}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: Platform.OS === 'web' ? {
    flex: 1,
    paddingHorizontal: 16,
    marginVertical: 24,
    width: '100%',
    maxWidth: CONTAINER_WIDTH.web,
    alignSelf: 'center',
  } : {
    flex: 1,
    paddingHorizontal: 16,
    marginVertical: 24,
    width: CONTAINER_WIDTH.mobile,
  },
  title: {
    fontSize: 24,
    fontFamily: FONT.semiBold,
    color: COLORS.white,
    marginBottom: 24,
  },
  editButton: {
    marginBottom: 16,
    backgroundColor: COLORS.secondary,
  },
  notificationContainer: {
    backgroundColor: COLORS.black100,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  notificationText: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: FONT.semiBold,
    textAlign: 'center',
  },
  dateSection: {
    backgroundColor: COLORS.black100,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 24,
  },
  backButton: {
    flex: 1,
    backgroundColor: COLORS.black100,
  },
  submitButton: {
    flex: 1,
  },
  dateContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: FONT.medium,
    color: COLORS.white,
    marginBottom: 8,
  },
  dateButton: {
    backgroundColor: COLORS.black100,
    padding: 12,
    borderRadius: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  dateText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONT.regular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.black100,
    padding: 16,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthButton: {
    padding: 8,
  },
  monthButtonText: {
    color: COLORS.white,
    fontSize: 24,
    fontFamily: FONT.medium,
  },
  monthYearText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONT.medium,
    textTransform: 'capitalize',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekDayText: {
    width: '14.28%',
    textAlign: 'center',
    color: COLORS.white,
    marginBottom: 8,
    fontSize: 12,
    fontFamily: FONT.medium,
    textTransform: 'uppercase',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    borderRadius: 8,
  },
  dayText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONT.regular,
  },
  selectedDay: {
    backgroundColor: COLORS.secondary,
  },
  todayDay: {
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  selectedDayText: {
    color: COLORS.white,
    fontFamily: FONT.bold,
  },
  todayDayText: {
    color: COLORS.secondary,
    fontFamily: FONT.medium,
  },
});
