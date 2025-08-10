import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { tokens } from '../../../styles/tokens';
import { usePlatform } from '../../../hooks/usePlatform';

interface WebHeaderProps {
  title?: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
}

export const WebHeader: React.FC<WebHeaderProps> = ({
  title = 'Degra Freight',
  showSearch = true,
  onSearch,
  searchPlaceholder = 'Meklēt...',
  actions,
}) => {
  const { isWeb } = usePlatform();
  const [searchQuery, setSearchQuery] = React.useState('');

  // Only render on web platform
  if (!isWeb) return null;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <View className="bg-white border-b border-neutral-200 shadow-sm">
      <View className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <View className="flex flex-row items-center justify-between h-16">
          {/* Logo/Title Section */}
          <View className="flex flex-row items-center space-x-4">
            <Text className="text-2xl font-pbold text-primary-600">
              {title}
            </Text>
          </View>

          {/* Search Section */}
          {showSearch && (
            <View className="flex-1 max-w-md mx-8">
              <View className="relative">
                <TextInput
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           text-neutral-900 placeholder-neutral-500"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChangeText={handleSearch}
                  style={{
                    fontFamily: 'Poppins-Regular',
                    fontSize: tokens.typography.fontSize.sm.size,
                    lineHeight: tokens.typography.fontSize.sm.lineHeight,
                  }}
                />
                {/* Search Icon */}
                <View className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Text className="text-neutral-400">🔍</Text>
                </View>
              </View>
            </View>
          )}

          {/* Actions Section */}
          <View className="flex flex-row items-center space-x-4">
            {actions}
            
            {/* User Profile */}
            <TouchableOpacity 
              className="flex flex-row items-center space-x-2 px-3 py-2 rounded-lg 
                       hover:bg-neutral-100 transition-colors duration-200"
            >
              <View className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <Text className="text-white text-sm font-pmedium">U</Text>
              </View>
              <Text className="text-neutral-700 font-pmedium hidden sm:block">
                Lietotājs
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default WebHeader;