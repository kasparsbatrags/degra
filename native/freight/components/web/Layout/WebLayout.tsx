import React, { useState } from 'react';
import { View } from 'react-native';
import { usePlatform } from '../../../hooks/usePlatform';
import WebHeader from './WebHeader';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  isActive?: boolean;
  children?: NavItem[];
}

interface WebLayoutProps {
  children: React.ReactNode;
  // Header props
  headerTitle?: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  headerActions?: React.ReactNode;
  
  // Sidebar props
  navItems?: NavItem[];
  onNavigate?: (item: NavItem) => void;
  initialSidebarCollapsed?: boolean;
  
  // Content props
  contentScrollable?: boolean;
  contentPadding?: boolean;
  contentMaxWidth?: boolean;
  contentClassName?: string;
}

export const WebLayout: React.FC<WebLayoutProps> = ({
  children,
  headerTitle,
  showSearch = true,
  onSearch,
  searchPlaceholder,
  headerActions,
  navItems = [],
  onNavigate,
  initialSidebarCollapsed = false,
  contentScrollable = true,
  contentPadding = true,
  contentMaxWidth = true,
  contentClassName,
}) => {
  const { isWeb } = usePlatform();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(initialSidebarCollapsed);

  // Only render on web platform
  if (!isWeb) return <>{children}</>;

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const defaultNavItems: NavItem[] = [
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
      id: 'drivers',
      label: 'Vadītāji',
      icon: '👨‍💼',
      href: '/drivers',
    },
    {
      id: 'companies',
      label: 'Uzņēmumi',
      icon: '🏢',
      href: '/companies',
    },
    {
      id: 'reports',
      label: 'Atskaites',
      icon: '📈',
      href: '/reports',
      children: [
        { id: 'reports-financial', label: 'Finanšu', icon: '💰', href: '/reports/financial' },
        { id: 'reports-operations', label: 'Darbības', icon: '⚙️', href: '/reports/operations' },
      ],
    },
    {
      id: 'settings',
      label: 'Iestatījumi',
      icon: '⚙️',
      href: '/settings',
    },
  ];

  const finalNavItems = navItems.length > 0 ? navItems : defaultNavItems;

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <WebHeader
        title={headerTitle}
        showSearch={showSearch}
        onSearch={onSearch}
        searchPlaceholder={searchPlaceholder}
        actions={headerActions}
      />

      {/* Main Layout */}
      <View className="flex-1 flex flex-row">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          navItems={finalNavItems}
          onNavigate={onNavigate}
        />

        {/* Main Content */}
        <MainContent
          scrollable={contentScrollable}
          padding={contentPadding}
          maxWidth={contentMaxWidth}
          className={contentClassName}
        >
          {children}
        </MainContent>
      </View>
    </View>
  );
};

export default WebLayout;