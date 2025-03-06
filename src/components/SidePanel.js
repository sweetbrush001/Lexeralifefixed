import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const PANEL_WIDTH = width * 0.8;

const SidePanel = ({ 
  isOpen, 
  slideAnim, 
  overlayOpacity, 
  togglePanel, 
  currentUser, 
  navigation,
  handleLogout
}) => {
  
  // Handle menu item press
  const handleMenuItemPress = (screen) => {
    // Close the panel with animation
    togglePanel();
    
    // Handle the navigation after panel closes
    setTimeout(() => {
      if (screen === 'logout') {
        handleLogout();
      } else {
        navigation.navigate(screen);
      }
    }, 300);
  };

  // Generate a profile image URL
  const getProfileImage = () => {
    if (currentUser?.profileImage) {
      return { uri: currentUser.profileImage };
    } else if (currentUser?.photoURL) {
      return { uri: currentUser.photoURL };
    }
    return require('../../assets/profilepic.png');
  };
  
  return (
    <>
      {/* Overlay when panel is open */}
      <Animated.View 
        style={[
          styles.overlay,
          { 
            opacity: overlayOpacity,
            pointerEvents: isOpen ? 'auto' : 'none'
          }
        ]} 
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={togglePanel}
        />
      </Animated.View>

      {/* Side Panel */}
      <Animated.View 
        style={[
          styles.sidePanel,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        <BlurView intensity={30} style={styles.sidePanelContent}>
          {/* Enhanced Header with Gradient */}
          <LinearGradient
            colors={['#FF9F9F', '#FF6B6B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sidePanelHeader}
          >
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={togglePanel}
            >
              <Feather name="x" size={20} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={getProfileImage()}
                  style={styles.sidePanelProfilePic}
                />
              </View>
              <Text style={styles.sidePanelUsername}>
                {currentUser ? currentUser.displayName : 'Lexera User'}
              </Text>
              <Text style={styles.sidePanelEmail}>
                {currentUser ? currentUser.email : ''}
              </Text>
            </View>
          </LinearGradient>
          
          {/* Enhanced Menu */}
          <View style={styles.sidePanelMenu}>
            <MenuItem 
              icon="user" 
              title="Profile" 
              onPress={() => handleMenuItemPress('profile')} 
            />
            
            <MenuItem 
              icon="settings" 
              title="Settings" 
              onPress={() => handleMenuItemPress('settings')} 
            />
            
            <MenuItem 
              icon="message-square" 
              title="Feedback" 
              onPress={() => handleMenuItemPress('Feedback')} 
            />
            
            <MenuItem 
              icon="help-circle" 
              title="Help & Support" 
              onPress={() => handleMenuItemPress('help')} 
            />
            
            <View style={styles.divider} />
            
            <MenuItem 
              icon="log-out" 
              title="Logout" 
              onPress={() => handleMenuItemPress('logout')} 
              isLogout={true}
            />
          </View>
          
          <View style={styles.sidePanelFooter}>
            <Image 
              source={require('../../assets/Logo.png')} 
              style={styles.footerLogo} 
            />
            <Text style={styles.versionText}>Lexera Life v1.0.2</Text>
            <Text style={styles.copyrightText}>© 2025 Lexera Life</Text>
          </View>
        </BlurView>
      </Animated.View>
    </>
  );
};

// Helper component for menu items
const MenuItem = ({ icon, title, onPress, isLogout = false }) => (
  <TouchableOpacity 
    style={[
      styles.menuItem, 
      isLogout && styles.logoutItem
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[
      styles.menuIconContainer,
      isLogout && styles.logoutIconContainer
    ]}>
      <Feather name={icon} size={20} color={isLogout ? "#fff" : "#FF6B6B"} />
    </View>
    <Text style={[
      styles.menuItemText,
      isLogout && styles.logoutText
    ]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 1000,
  },
  overlayTouchable: {
    flex: 1,
  },
  sidePanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: PANEL_WIDTH,
    height: '100%',
    zIndex: 1001,
    elevation: 10,
  },
  sidePanelContent: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  sidePanelHeader: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  profileImageContainer: {
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 45,
    marginBottom: 15,
  },
  sidePanelProfilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  sidePanelUsername: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  sidePanelEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  sidePanelMenu: {
    padding: 20,
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderRadius: 16,
    marginBottom: 8,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFE6E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
    marginHorizontal: 10,
  },
  logoutItem: {
    backgroundColor: '#FFF0F0',
    borderRadius: 16,
  },
  logoutIconContainer: {
    backgroundColor: '#FF6B6B',
  },
  logoutText: {
    color: '#FF6B6B',
  },
  sidePanelFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  footerLogo: {
    width: 40,
    height: 40,
    marginBottom: 10,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
  },
});

export default SidePanel;
