import React from 'react';
import { View, Text, Image, ImageBackground } from 'react-native';
import { usePlatform } from '../../../hooks/usePlatform';
import { tokens } from '../../../styles/tokens';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title = 'Degra Freight',
  subtitle = 'Auto izmantošanas uzskaites sistēma',
  showLogo = true,
}) => {
  const { isWeb, deviceType } = usePlatform();

  if (!isWeb) {
    // Return mobile layout (keep existing mobile structure)
    return (
      <View className="flex-1 bg-mobile-primary">
        {children}
      </View>
    );
  }

  // Web-specific auth layout
  return (
    <View className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex flex-row">
      {/* Left Side - Branding */}
      <View className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-primary-600 to-primary-800">
        {/* Background Pattern */}
        <View className="absolute inset-0 opacity-10">
          <View className="w-full h-full" />
        </View>
        
        {/* Content */}
        <View className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
          {/* Logo */}
          {showLogo && (
            <View className="mb-8">
              <View className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                <Text className="text-4xl font-pbold text-primary-600">🚛</Text>
              </View>
            </View>
          )}
          
          {/* Main Title */}
          <Text className="text-4xl md:text-5xl font-pbold text-white mb-4">
            {title}
          </Text>
          
          {/* Subtitle */}
          <Text className="text-xl text-primary-100 mb-8 max-w-md leading-relaxed">
            {subtitle}
          </Text>
          
          {/* Features */}
          <View className="space-y-4 max-w-sm">
            {[
              { icon: '📊', text: 'Reāllaika atskaites un analītika' },
              { icon: '🚚', text: 'Transportlīdzekļu pārvaldība' },
              { icon: '📱', text: 'Pieejams visās ierīcēs' },
            ].map((feature, index) => (
              <View key={index} className="flex flex-row items-center space-x-3">
                <Text className="text-2xl">{feature.icon}</Text>
                <Text className="text-primary-100 font-pmedium">{feature.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Right Side - Auth Form */}
      <View className="flex-1 lg:flex-none lg:w-96 xl:w-[480px] flex items-center justify-center p-8">
        <View className="w-full max-w-md">
          {/* Mobile Logo (visible on small screens) */}
          {showLogo && (
            <View className="lg:hidden mb-8 text-center">
              <View className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Text className="text-2xl text-white">🚛</Text>
              </View>
              <Text className="text-2xl font-pbold text-neutral-900 mb-2">
                {title}
              </Text>
              <Text className="text-neutral-600 font-pmedium">
                {subtitle}
              </Text>
            </View>
          )}

          {/* Auth Form Container */}
          <View className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-200">
            {children}
          </View>

          {/* Footer */}
          <Text className="text-center text-sm text-neutral-500 mt-6">
            © 2024 Degra. Visas tiesības aizsargātas.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default AuthLayout;