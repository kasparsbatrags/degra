import React from 'react';
import { View, Text } from 'react-native';
import { usePlatform } from '../hooks/usePlatform';

interface SimpleAuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const SimpleAuthLayout: React.FC<SimpleAuthLayoutProps> = ({
  children,
  title = 'Degra Freight',
  subtitle = 'Auto izmantošanas uzskaites sistēma',
}) => {
  const { isWeb } = usePlatform();

  if (!isWeb) {
    // Return mobile layout (keep existing mobile structure)
    return <>{children}</>;
  }

  // Simple web layout without complex styling
  return (
    <View style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      flexDirection: 'row',
    }}>
      {/* Left Side - Branding */}
      <View style={{
        display: 'none',
        '@media (min-width: 1024px)': {
          display: 'flex',
          flex: 1,
          backgroundColor: '#0284c7',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 48,
        }
      }}>
        <View style={{ textAlign: 'center' }}>
          <View style={{
            width: 96,
            height: 96,
            backgroundColor: 'white',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          }}>
            <Text style={{ fontSize: 36 }}>🚛</Text>
          </View>
          
          <Text style={{
            fontSize: 48,
            fontFamily: 'Poppins-Bold',
            color: 'white',
            marginBottom: 16,
          }}>
            {title}
          </Text>
          
          <Text style={{
            fontSize: 20,
            color: '#e0f2fe',
            marginBottom: 32,
            maxWidth: 384,
          }}>
            {subtitle}
          </Text>
        </View>
      </View>

      {/* Right Side - Auth Form */}
      <View style={{
        flex: 1,
        maxWidth: isWeb ? 480 : '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
      }}>
        <View style={{ width: '100%', maxWidth: 448 }}>
          {/* Mobile Logo */}
          <View style={{
            display: isWeb && window.innerWidth >= 1024 ? 'none' : 'flex',
            marginBottom: 32,
            alignItems: 'center',
          }}>
            <View style={{
              width: 64,
              height: 64,
              backgroundColor: '#0ea5e9',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Text style={{ fontSize: 24, color: 'white' }}>🚛</Text>
            </View>
            <Text style={{
              fontSize: 24,
              fontFamily: 'Poppins-Bold',
              color: '#171717',
              marginBottom: 8,
            }}>
              {title}
            </Text>
            <Text style={{
              color: '#525252',
              fontFamily: 'Poppins-Medium',
            }}>
              {subtitle}
            </Text>
          </View>

          {/* Auth Form Container */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 32,
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            border: '1px solid #e5e5e5',
          }}>
            {children}
          </View>

          {/* Footer */}
          <Text style={{
            textAlign: 'center',
            fontSize: 14,
            color: '#737373',
            marginTop: 24,
          }}>
            © 2024 Degra. Visas tiesības aizsargātas.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default SimpleAuthLayout;