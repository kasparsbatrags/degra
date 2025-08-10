import React from 'react';
import { View } from 'react-native';
import { useAdaptiveComponents, usePlatform } from '../hooks/usePlatform';
import { WebLayout, NavItem } from './web';

// Mobile layout (existing stack-based navigation)
interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  // Use existing mobile layout structure
  return <View className="flex-1">{children}</View>;
};

// Adaptive Layout Props
interface AdaptiveLayoutProps {
  children: React.ReactNode;
  
  // Web-specific props
  headerTitle?: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  headerActions?: React.ReactNode;
  navItems?: NavItem[];
  onNavigate?: (item: NavItem) => void;
  initialSidebarCollapsed?: boolean;
  
  // Content props
  contentScrollable?: boolean;
  contentPadding?: boolean;
  contentMaxWidth?: boolean;
  contentClassName?: string;
}

export const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = ({
  children,
  headerTitle,
  showSearch,
  onSearch,
  searchPlaceholder,
  headerActions,
  navItems,
  onNavigate,
  initialSidebarCollapsed,
  contentScrollable,
  contentPadding,
  contentMaxWidth,
  contentClassName,
}) => {
  const { isWeb, platform, deviceType } = usePlatform();

  // Select appropriate layout based on platform and device
  const LayoutComponent = useAdaptiveComponents({
    web: WebLayout,
    mobile: MobileLayout,
    tablet: WebLayout, // Use web layout for tablets
    fallback: MobileLayout,
  });

  // Pass web-specific props only to WebLayout
  if (isWeb || deviceType === 'tablet') {
    return (
      <LayoutComponent
        headerTitle={headerTitle}
        showSearch={showSearch}
        onSearch={onSearch}
        searchPlaceholder={searchPlaceholder}
        headerActions={headerActions}
        navItems={navItems}
        onNavigate={onNavigate}
        initialSidebarCollapsed={initialSidebarCollapsed}
        contentScrollable={contentScrollable}
        contentPadding={contentPadding}
        contentMaxWidth={contentMaxWidth}
        contentClassName={contentClassName}
      >
        {children}
      </LayoutComponent>
    );
  }

  // Mobile layout - just render children with basic wrapper
  return (
    <LayoutComponent>
      {children}
    </LayoutComponent>
  );
};

export default AdaptiveLayout;