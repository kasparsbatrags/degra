import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TruckRoutePageDto } from '@/dto/TruckRoutePageDto';
import { useAuth } from '@/context/AuthContext';

export type TabType = 'basic' | 'odometer' | 'fuel';

interface ModernRouteCardProps {
  item: TruckRoutePageDto;
  onPress: () => void;
  onTabChange: (tabType: TabType) => void;
}

export const ModernRouteCard: React.FC<ModernRouteCardProps> = ({
  item,
  onPress,
  onTabChange,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>(item.activeTab || 'basic');

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('lv-LV', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const formatNumber = (num?: number) => {
    return num?.toLocaleString() ?? '0';
  };

  return (
    <TouchableOpacity
      className="degra-route-card animated fadeIn"
      style={{ cursor: 'pointer' }}
      onPress={onPress}
      activeOpacity={0.95}
    >
      {/* Tab Container */}
      <View className="degra-tab-container" style={{ marginBottom: 0 }}>
        {/* Tab Buttons */}
        <View style={{ display: 'flex', flexDirection: 'row' }}>
          <TouchableOpacity
            className={`degra-tab-button ${activeTab === 'basic' ? 'active' : ''}`}
            onPress={() => handleTabClick('basic')}
            style={{ flex: 1 }}
          >
            <Text style={{ 
              color: activeTab === 'basic' ? 'white' : '#6b7280',
              fontWeight: '500',
              fontSize: 14
            }}>
              Pamatinfo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`degra-tab-button ${activeTab === 'odometer' ? 'active' : ''}`}
            onPress={() => handleTabClick('odometer')}
            style={{ flex: 1 }}
          >
            <Text style={{ 
              color: activeTab === 'odometer' ? 'white' : '#6b7280',
              fontWeight: '500',
              fontSize: 14
            }}>
              Odometrs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`degra-tab-button ${activeTab === 'fuel' ? 'active' : ''}`}
            onPress={() => handleTabClick('fuel')}
            style={{ flex: 1 }}
          >
            <Text style={{ 
              color: activeTab === 'fuel' ? 'white' : '#6b7280',
              fontWeight: '500',
              fontSize: 14
            }}>
              Degviela
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View className={`degra-tab-content ${activeTab}`}>
          {activeTab === 'basic' && (
            <View className="degra-stats-grid">
              <View className="degra-stat-item">
                <Text className="degra-stat-label">Periods:</Text>
                <Text className="degra-stat-value">
                  {formatDate(item.dateFrom)} - {formatDate(item.dateTo)}
                </Text>
              </View>
              
              <View className="degra-stat-item">
                <Text className="degra-stat-label">Auto:</Text>
                <Text className="degra-stat-value">
                  {item.truck?.registrationNumber || 'Nav pieejams'}
                </Text>
              </View>
              
              <View className="degra-stat-item">
                <Text className="degra-stat-label">Vadītājs:</Text>
                <Text className="degra-stat-value">
                  {[user?.firstName, user?.lastName].filter(Boolean).join(' ')}
                </Text>
              </View>
            </View>
          )}

          {activeTab === 'odometer' && (
            <View className="degra-stats-grid">
              <View className="degra-stat-item">
                <Text className="degra-stat-label">Startā:</Text>
                <Text className="degra-stat-value">
                  {formatNumber(item.odometerAtRouteStart)} km
                </Text>
              </View>
              
              <View className="degra-stat-item">
                <Text className="degra-stat-label">Distance:</Text>
                <Text className="degra-stat-value highlight">
                  {formatNumber(item.computedTotalRoutesLength)} km
                </Text>
              </View>
              
              <View className="degra-stat-item">
                <Text className="degra-stat-label">Finišā:</Text>
                <Text className="degra-stat-value">
                  {formatNumber(item.odometerAtRouteFinish)} km
                </Text>
              </View>
            </View>
          )}

          {activeTab === 'fuel' && (
            <View className="degra-stats-grid">
              <View className="degra-stat-item">
                <Text className="degra-stat-label">Norma:</Text>
                <Text className="degra-stat-value">
                  {item.truck?.fuelConsumptionNorm || 0} L/100 Km
                </Text>
              </View>
              
              <View className="degra-stat-item">
                <Text className="degra-stat-label">Sākumā:</Text>
                <Text className="degra-stat-value">
                  {item.fuelBalanceAtStart} L
                </Text>
              </View>
              
              <View className="degra-stat-item">
                <Text className="degra-stat-label">Saņemta:</Text>
                <Text className="degra-stat-value success">
                  +{formatNumber(item.totalFuelReceivedOnRoutes)} L
                </Text>
              </View>
              
              <View className="degra-stat-item">
                <Text className="degra-stat-label">Patērēta:</Text>
                <Text className="degra-stat-value warning">
                  {formatNumber(item.totalFuelConsumedOnRoutes)} L
                </Text>
              </View>
              
              <View className="degra-stat-item">
                <Text className="degra-stat-label">Beigās:</Text>
                <Text className="degra-stat-value">
                  {formatNumber(item.fuelBalanceAtRoutesFinish)} L
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ModernRouteCard;