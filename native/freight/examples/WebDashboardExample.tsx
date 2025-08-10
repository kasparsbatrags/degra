import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AdaptiveLayout from '../components/AdaptiveLayout';
import { NavItem } from '../components/web';
import { usePlatform } from '../hooks/usePlatform';
import { tokens } from '../styles/tokens';

/**
 * Demonstration of the new web-optimized design system
 * This example shows how to use the AdaptiveLayout with web components
 */
export const WebDashboardExample: React.FC = () => {
  const { isWeb, deviceType, platform } = usePlatform();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  // Sample data
  const trucksData = [
    { id: '1', number: 'LV-1001', driver: 'Jānis Bērziņš', status: 'Ceļā', location: 'Rīga → Berlīne' },
    { id: '2', number: 'LV-1002', driver: 'Pēteris Ozols', status: 'Nogādāts', location: 'Hamburg' },
    { id: '3', number: 'LV-1003', driver: 'Andris Liepa', status: 'Iekraušana', location: 'Rīga' },
  ];

  const recentActivity = [
    { id: '1', action: 'Jauns brauciens izveidots', time: '10:30', user: 'Jānis B.' },
    { id: '2', action: 'Kravu nogādāta', time: '09:15', user: 'Pēteris O.' },
    { id: '3', action: 'Rēķins apstiprināts', time: '08:45', user: 'Anna K.' },
  ];

  // Navigation items for demonstration
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      href: '/',
      isActive: true,
    },
    {
      id: 'routes',
      label: 'Braucieni',
      icon: '🚛',
      href: '/routes',
      children: [
        { id: 'routes-active', label: 'Aktīvie', icon: '▶️', href: '/routes/active' },
        { id: 'routes-completed', label: 'Pabeigti', icon: '✅', href: '/routes/completed' },
        { id: 'routes-new', label: 'Jauns brauciens', icon: '➕', href: '/routes/new' },
      ],
    },
    {
      id: 'trucks',
      label: 'Transportlīdzekļi',
      icon: '🚚',
      href: '/trucks',
    },
    {
      id: 'companies',
      label: 'Uzņēmumi',
      icon: '🏢',
      href: '/companies',
    },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Meklē:', query);
  };

  const handleNavigate = (item: NavItem) => {
    console.log('Navigēt uz:', item.href);
    setSelectedRoute(item.id);
  };

  const HeaderActions = () => (
    <View className="flex flex-row items-center space-x-2">
      <TouchableOpacity className="btn-secondary px-3 py-2 rounded-lg">
        <Text className="text-primary-600 font-pmedium">Jauns brauciens</Text>
      </TouchableOpacity>
      <TouchableOpacity className="btn-primary px-3 py-2 rounded-lg">
        <Text className="text-white font-pmedium">Atskaites</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <AdaptiveLayout
      headerTitle="Degra Freight System"
      showSearch={true}
      onSearch={handleSearch}
      searchPlaceholder="Meklēt braucieni, vadītāji, uzņēmumi..."
      headerActions={<HeaderActions />}
      navItems={navItems}
      onNavigate={handleNavigate}
      initialSidebarCollapsed={false}
    >
      {/* Dashboard Content */}
      <View className="space-y-6">
        {/* Platform Info Banner (for demonstration) */}
        <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <Text className="text-blue-800 font-pmedium mb-2">
            🚀 Jauna dizaina sistēma aktīva!
          </Text>
          <View className="text-blue-700">
            <Text className="text-sm">• Platforma: {platform}</Text>
            <Text className="text-sm">• Ierīces tips: {deviceType}</Text>
            <Text className="text-sm">• Web optimizēts: {isWeb ? 'Jā' : 'Nē'}</Text>
            {searchQuery && <Text className="text-sm">• Meklējamais: "{searchQuery}"</Text>}
          </View>
        </View>

        {/* Stats Cards */}
        <View className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Aktīvie braucieni', value: '12', icon: '🚛', color: 'bg-blue-500' },
            { title: 'Pabeigti šodien', value: '8', icon: '✅', color: 'bg-green-500' },
            { title: 'Kopējais apgrozījums', value: '€24,580', icon: '💰', color: 'bg-yellow-500' },
            { title: 'Aktīvie vadītāji', value: '15', icon: '👨‍💼', color: 'bg-purple-500' },
          ].map((stat, index) => (
            <View key={index} className="card hover:shadow-md transition-shadow">
              <View className="flex flex-row items-center">
                <View className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mr-4`}>
                  <Text className="text-white text-xl">{stat.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-2xl font-pbold text-neutral-900">{stat.value}</Text>
                  <Text className="text-sm text-neutral-600">{stat.title}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Main Content Grid */}
        <View className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Trucks Table */}
          <View className="card">
            <Text className="text-lg font-psemibold text-neutral-900 mb-4">
              Aktīvie transportlīdzekļi
            </Text>
            <View className="overflow-hidden">
              <View className="table w-full">
                {/* Table Header */}
                <View className="flex flex-row bg-neutral-50 border-b border-neutral-200">
                  <Text className="flex-1 py-3 px-4 text-left text-xs font-pmedium text-neutral-500 uppercase">
                    Numurs
                  </Text>
                  <Text className="flex-1 py-3 px-4 text-left text-xs font-pmedium text-neutral-500 uppercase">
                    Vadītājs
                  </Text>
                  <Text className="flex-1 py-3 px-4 text-left text-xs font-pmedium text-neutral-500 uppercase">
                    Status
                  </Text>
                </View>
                
                {/* Table Body */}
                {trucksData.map((truck) => (
                  <TouchableOpacity
                    key={truck.id}
                    className="flex flex-row border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                  >
                    <Text className="flex-1 py-3 px-4 text-sm font-pmedium text-neutral-900">
                      {truck.number}
                    </Text>
                    <Text className="flex-1 py-3 px-4 text-sm text-neutral-600">
                      {truck.driver}
                    </Text>
                    <View className="flex-1 py-3 px-4">
                      <View className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-pmedium ${
                        truck.status === 'Ceļā' ? 'bg-blue-100 text-blue-800' :
                        truck.status === 'Nogādāts' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        <Text className="text-xs">{truck.status}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Recent Activity */}
          <View className="card">
            <Text className="text-lg font-psemibold text-neutral-900 mb-4">
              Pēdējās aktivitātes
            </Text>
            <View className="space-y-3">
              {recentActivity.map((activity) => (
                <View key={activity.id} className="flex flex-row items-center py-2">
                  <View className="w-2 h-2 bg-blue-500 rounded-full mr-3"></View>
                  <View className="flex-1">
                    <Text className="text-sm font-pmedium text-neutral-900">
                      {activity.action}
                    </Text>
                    <Text className="text-xs text-neutral-500">
                      {activity.time} • {activity.user}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            
            <TouchableOpacity className="mt-4 text-center py-2">
              <Text className="text-primary-600 font-pmedium text-sm">
                Skatīt visu aktivitāti →
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="card">
          <Text className="text-lg font-psemibold text-neutral-900 mb-4">
            Ātrās darbības
          </Text>
          <View className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Jauns brauciens', icon: '➕', color: 'bg-blue-500' },
              { label: 'Pievienot vadītāju', icon: '👨‍💼', color: 'bg-green-500' },
              { label: 'Uzņēmumu reģistrs', icon: '🏢', color: 'bg-purple-500' },
              { label: 'Atskaites', icon: '📊', color: 'bg-orange-500' },
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                className="flex flex-col items-center p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-all"
              >
                <View className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-2`}>
                  <Text className="text-white text-xl">{action.icon}</Text>
                </View>
                <Text className="text-sm font-pmedium text-neutral-700 text-center">
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </AdaptiveLayout>
  );
};

export default WebDashboardExample;