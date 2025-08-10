import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { tokens } from '../../../styles/tokens';
import { usePlatform } from '../../../hooks/usePlatform';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  isActive?: boolean;
  children?: NavItem[];
}

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  navItems: NavItem[];
  onNavigate?: (item: NavItem) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  navItems,
  onNavigate,
}) => {
  const { isWeb } = usePlatform();

  // Only render on web platform
  if (!isWeb) return null;

  const sidebarWidth = isCollapsed ? tokens.components.sidebar.width.collapsed : tokens.components.sidebar.width.expanded;

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const paddingLeft = 16 + (level * 12);

    return (
      <View key={item.id}>
        <TouchableOpacity
          onPress={() => onNavigate?.(item)}
          className={`flex flex-row items-center px-3 py-2 mx-2 rounded-lg transition-colors duration-200 ${
            item.isActive 
              ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600' 
              : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
          }`}
          style={{ paddingLeft }}
        >
          {/* Icon */}
          <View className="flex items-center justify-center w-5 h-5 mr-3">
            <Text className="text-lg">{item.icon}</Text>
          </View>
          
          {/* Label */}
          {!isCollapsed && (
            <Text 
              className={`flex-1 font-pmedium text-sm ${
                item.isActive ? 'text-primary-700' : 'text-neutral-700'
              }`}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          )}
          
          {/* Expand/Collapse Arrow */}
          {!isCollapsed && hasChildren && (
            <Text className="text-neutral-400 ml-auto">›</Text>
          )}
        </TouchableOpacity>

        {/* Children */}
        {!isCollapsed && hasChildren && item.children?.map(child => 
          renderNavItem(child, level + 1)
        )}
      </View>
    );
  };

  return (
    <View 
      className="bg-white border-r border-neutral-200 flex-shrink-0 hidden lg:block"
      style={{ width: sidebarWidth }}
    >
      <View className="h-full flex flex-col">
        {/* Sidebar Header */}
        <View className="flex flex-row items-center justify-between p-4 border-b border-neutral-200">
          {!isCollapsed && (
            <Text className="font-psemibold text-lg text-neutral-800">
              Navigācija
            </Text>
          )}
          
          <TouchableOpacity
            onPress={onToggleCollapse}
            className="p-1 rounded hover:bg-neutral-100 transition-colors duration-200"
          >
            <Text className="text-neutral-500">
              {isCollapsed ? '→' : '←'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Navigation Items */}
        <ScrollView 
          className="flex-1 py-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="space-y-1">
            {navItems.map(item => renderNavItem(item))}
          </View>
        </ScrollView>

        {/* Sidebar Footer */}
        <View className="border-t border-neutral-200 p-4">
          {!isCollapsed && (
            <View className="flex flex-row items-center space-x-3">
              <View className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                <Text className="text-neutral-600 text-xs">⚙️</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-pmedium text-neutral-700">
                  Iestatījumi
                </Text>
                <Text className="text-xs text-neutral-500">
                  Versija 1.0.0
                </Text>
              </View>
            </View>
          )}
          
          {isCollapsed && (
            <TouchableOpacity className="flex items-center justify-center">
              <Text className="text-neutral-600">⚙️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default Sidebar;