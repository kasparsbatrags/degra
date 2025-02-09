import FontAwesome from '@expo/vector-icons/FontAwesome'
import {useRouter} from 'expo-router'
import React from 'react'
import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {COLORS, FONT} from '../constants/theme'
import {useAuth} from '../context/AuthContext'

interface MenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function Menu({ visible, onClose }: MenuProps) {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleNavigation = (route: '/' | '/profile' | '/truck-route' | 'logout') => {
    if (route === 'logout') {
      signOut();
      return;
    }
    onClose();
    router.push(route);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Izvēlne</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome name="times" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleNavigation('/')}
          >
            <FontAwesome name="home" size={20} color={COLORS.white} style={styles.menuIcon} />
            <Text style={styles.menuText}>Sākums</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleNavigation('/profile')}
          >
            <FontAwesome name="user" size={20} color={COLORS.white} style={styles.menuIcon} />
            <Text style={styles.menuText}>Profils</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutItem]}
            onPress={() => handleNavigation('logout')}
          >
            <FontAwesome name="sign-out" size={20} color={COLORS.error} style={styles.menuIcon} />
            <Text style={[styles.menuText, styles.logoutText]}>Iziet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    width: 300,
    height: '100%',
    backgroundColor: COLORS.primary,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.black100,
  },
  title: {
    fontSize: 24,
    fontFamily: FONT.semiBold,
    color: COLORS.white,
  },
  closeButton: {
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.black100,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    fontFamily: FONT.medium,
    color: COLORS.white,
  },
  logoutItem: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: COLORS.black100,
  },
  logoutText: {
    color: COLORS.error,
  },
});
