import {formStyles} from '@/constants/styles'
import {WEB_DATE_PICKER} from '@/constants/webStyles'
import React, {useState} from 'react'
import {Modal, Platform, Pressable, Text, TouchableOpacity, View} from 'react-native'

interface FormDatePickerProps {
  label: string
  value: Date
  onChange: (date: Date) => void
  error?: string
  showError?: boolean
  disabled?: boolean
}

export default function FormDatePicker({ 
  label, 
  value, 
  onChange,
  error,
  showError,
  disabled
}: FormDatePickerProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)

  return (
    <View style={[formStyles.inputContainer, { flex: undefined, height: undefined, marginBottom: 16, marginTop: 28 }]}>
      <Text style={formStyles.label}>{label}</Text>
      <TouchableOpacity
        style={[
          formStyles.dateButton, 
          showError && formStyles.inputError,
          disabled && formStyles.inputDisabled
        ]}
        onPress={() => !disabled && setShowDatePicker(true)}
        disabled={disabled}
      >
        <Text style={formStyles.dateText}>
          {`${value.getDate().toString().padStart(2, '0')}.${(value.getMonth() + 1).toString().padStart(2, '0')}.${value.getFullYear()}`}
        </Text>
      </TouchableOpacity>
      {error && showError && <Text style={[formStyles.errorText, { fontSize: 14, marginTop: 4 }]}>{error}</Text>}

      {showDatePicker && (
        <Modal
          transparent={true}
          visible={showDatePicker}
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <Pressable
            style={formStyles.modalOverlay}
            onPress={() => setShowDatePicker(false)}
          >
            <Pressable
              style={[
                formStyles.modalContent,
                Platform.select({
                  web: { width: WEB_DATE_PICKER.modalWidth }
                })
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={formStyles.calendarHeader}>
                <TouchableOpacity
                  style={formStyles.monthButton}
                  onPress={() => {
                    const newDate = new Date(value)
                    newDate.setMonth(newDate.getMonth() - 1)
                    onChange(newDate)
                  }}
                >
                  <Text style={formStyles.monthButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={formStyles.monthYearText}>
                  {value.toLocaleDateString('lv-LV', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </Text>
                <TouchableOpacity
                  style={formStyles.monthButton}
                  onPress={() => {
                    const newDate = new Date(value)
                    newDate.setMonth(newDate.getMonth() + 1)
                    onChange(newDate)
                  }}
                >
                  <Text style={formStyles.monthButtonText}>→</Text>
                </TouchableOpacity>
              </View>
              <View style={formStyles.weekDaysRow}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <Text key={i} style={formStyles.weekDayText}>
                    {new Date(2024, 0, i + 1).toLocaleDateString('lv-LV', { weekday: 'short' })}
                  </Text>
                ))}
              </View>
              <View style={formStyles.daysGrid}>
                {(() => {
                  const year = value.getFullYear()
                  const month = value.getMonth()
                  const firstDay = new Date(year, month, 1)
                  const lastDay = new Date(year, month + 1, 0)
                  const startingDay = firstDay.getDay()
                  const totalDays = lastDay.getDate()

                  const days = []
                  // Add empty spaces for days before the first day of the month
                  for (let i = 0; i < startingDay; i++) {
                    days.push(<View key={`empty-${i}`} style={[
                      formStyles.dayButton,
                      Platform.select({
                        web: { width: WEB_DATE_PICKER.dayButtonSize, height: WEB_DATE_PICKER.dayButtonSize }
                      })
                    ]} />)
                  }

                  // Add the days of the month
                  for (let i = 1; i <= totalDays; i++) {
                    const date = new Date(year, month, i)
                    const isSelected = date.toDateString() === value.toDateString()
                    const isToday = date.toDateString() === new Date().toDateString()

                    days.push(
                      <Pressable
                        key={i}
                        style={[
                          formStyles.dayButton,
                          Platform.select({
                            web: { width: WEB_DATE_PICKER.dayButtonSize, height: WEB_DATE_PICKER.dayButtonSize }
                          }),
                          isSelected && formStyles.selectedDay,
                          isToday && formStyles.todayDay
                        ]}
                        onPress={() => {
                          onChange(date)
                          setShowDatePicker(false)
                        }}
                      >
                        <Text
                          style={[
                            formStyles.dayText,
                            isSelected && formStyles.selectedDayText,
                            isToday && formStyles.todayDayText
                          ]}
                        >
                          {i}
                        </Text>
                      </Pressable>
                    )
                  }

                  return days
                })()}
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  )
}
