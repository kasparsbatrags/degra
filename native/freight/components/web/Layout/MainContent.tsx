import React from 'react';
import { View, ScrollView } from 'react-native';
import { usePlatform } from '../../../hooks/usePlatform';

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
  padding?: boolean;
  maxWidth?: boolean;
}

export const MainContent: React.FC<MainContentProps> = ({
  children,
  className = '',
  scrollable = true,
  padding = true,
  maxWidth = true,
}) => {
  const { isWeb } = usePlatform();

  // Only render on web platform
  if (!isWeb) return null;

  const baseClasses = [
    'flex-1',
    'bg-neutral-50',
    padding && 'p-6',
    className,
  ].filter(Boolean).join(' ');

  const contentClasses = [
    maxWidth && 'mx-auto max-w-7xl',
    'w-full',
  ].filter(Boolean).join(' ');

  if (scrollable) {
    return (
      <ScrollView 
        className={baseClasses}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View className={contentClasses}>
          {children}
        </View>
      </ScrollView>
    );
  }

  return (
    <View className={baseClasses}>
      <View className={contentClasses}>
        {children}
      </View>
    </View>
  );
};

export default MainContent;