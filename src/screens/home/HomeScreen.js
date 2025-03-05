import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
  BackHandler,
  Text,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';

// Components
import TextReaderRoot from '../../components/TextReaderRoot';
import ReadableText from '../../components/ReadableText';
import SidePanel from '../../components/home/SidePanel';
import FeatureCard from '../../components/home/FeatureCard';

// Custom hooks
import useUserData from '../../hooks/useUserData';
import useMotivationalTexts from '../../hooks/useMotivationalTexts';
import useFeatureNavigation from '../../hooks/useFeatureNavigation';

// Utils
import { isUserOnboarded, markUserAsOnboarded } from '../../utils/introService';
import { isNewUserInFirebase } from '../../utils/userFirebaseUtils';

const { width } = Dimensions.get('window');
const PANEL_WIDTH = width * 0.8;

const HomeScreen = ({ route, navigation }) => {
  // Custom hooks
  const { currentUser, getProfileImage } = useUserData();
  const { currentText, loading: textLoading } = useMotivationalTexts();
  const handleFeatureNavigation = useFeatureNavigation(navigation, isNewUser);
  
  // State variables
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  
  // Animation refs
  const slideAnim = useRef(new Animated.Value(-PANEL_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Check if the user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const onboarded = await isUserOnboarded();
      setIsFirstTimeUser(!onboarded);
      
      if (!onboarded) {
        await markUserAsOnboarded();
        setIsNewUser(true);
      }
    };
    
    checkOnboardingStatus();
  }, []);

  // Check new user status
  useEffect(() => {
    const checkNewUserStatus = async () => {
      try {
        if (route.params?.isNewUser !== undefined) {
          setIsNewUser(route.params.isNewUser);
          return;
        }
        
        const newUserStatus = await isNewUserInFirebase();
        setIsNewUser(newUserStatus);
      } catch (error) {
        console.error("Error checking new user status:", error);
        setIsNewUser(false);
      }
    };
    
    checkNewUserStatus();
  }, [route.params?.isNewUser]);

  // Handle back button press
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (isPanelOpen) {
          togglePanel();
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [isPanelOpen])
  );

  // Toggle side panel - memoized
  const togglePanel = useCallback(() => {
    if (isPanelOpen) {
      // Close panel
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -PANEL_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsPanelOpen(false);
      });
    } else {
      // Open panel
      setIsPanelOpen(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0.6,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isPanelOpen, slideAnim, overlayOpacity]);

  // Handle menu item press - memoized
  const handleMenuItemPress = useCallback((screen) => {
    // First close the panel with animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -PANEL_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsPanelOpen(false);
      
      // Then navigate or perform action
      if (screen === 'logout') {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', onPress: () => console.log('User logged out') },
        ]);
      } else if (screen === 'feedback') {
        navigation.navigate('Feedback');
      } else {
        navigation.navigate(screen);
      }
    });
  }, [navigation, slideAnim, overlayOpacity]);

  return (
    <TextReaderRoot>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        
        {/* Modern App Header */}
        <View style={styles.header}>
          <View style={styles.headerMain}>
            <Image
              source={require('../../../assets/Logo.png')}
              style={styles.logo}
            />
            <ReadableText style={styles.logoText} readable={false}>
              Lexera Life
            </ReadableText>
          </View>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={togglePanel}
          >
            <Feather name="menu" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
        
        {/* User Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.userInfoSection}>
            <ReadableText style={styles.welcomeText} readable={true} priority={1}>
              Hello,
            </ReadableText>
            <ReadableText style={styles.userName} readable={true} priority={2}>
              {currentUser ? currentUser.displayName : 'Lexera User'}
            </ReadableText>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('profile')}
          >
            <Image source={getProfileImage()} style={styles.profilePicture} />
          </TouchableOpacity>
        </View>

        {/* Motivational Card */}
        <LinearGradient
          colors={['#FF9F9F', '#FF6B6B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.messageCard}
        >
          <ReadableText style={styles.messageText} readable={true} priority={3}>
            {textLoading ? "Loading inspiration..." : currentText}
          </ReadableText>
        </LinearGradient>

        {/* Features heading */}
        <ReadableText style={styles.sectionTitle} readable={false}>
          Features
        </ReadableText>
        
        <View style={styles.featureGrid}>
          {/* Row 1 */}
          <View style={styles.featureRow}>
            <FeatureCard
              title="Lexera Bot"
              iconType="material"
              iconName="robot"
              cardStyle={styles.primaryCard}
              priority={4}
              onPress={() => handleFeatureNavigation('chatbot', 'ChatbotIntro', 'Chatbot')}
            />
            
            <FeatureCard
              title="Brain Training"
              iconType="material"
              iconName="brain"
              cardStyle={styles.secondaryCard}
              priority={5}
              onPress={() => handleFeatureNavigation('game', 'GameIntro', 'Game')}
            />
          </View>
          
          {/* Row 2 */}
          <View style={styles.featureRow}>
            <FeatureCard
              title="Dyslexia Test"
              iconType="feather"
              iconName="clipboard"
              cardStyle={styles.secondaryCard}
              priority={6}
              onPress={() => handleFeatureNavigation('test', 'TestIntroIntro', 'Teststarting')}
            />
            
            <FeatureCard
              title="Relax"
              iconType="feather"
              iconName="heart"
              cardStyle={styles.primaryCard}
              priority={7}
              onPress={() => handleFeatureNavigation('relax', 'RelaxIntro', 'Relax')}
            />
          </View>
          
          {/* Row 3 */}
          <View style={styles.featureRow}>
            
            <FeatureCard
              title="Community"
              iconType="feather"
              iconName="users"
              cardStyle={styles.primaryCard}
              priority={9}
              onPress={() => handleFeatureNavigation('community', 'CommunityIntro', 'Community')}
            />
          </View>
        </View>

        {/* Side Panel */}
        <SidePanel
          isPanelOpen={isPanelOpen}
          slideAnim={slideAnim}
          overlayOpacity={overlayOpacity}
          togglePanel={togglePanel}
          currentUser={currentUser}
          getProfileImage={getProfileImage}
          handleMenuItemPress={handleMenuItemPress}
        />
      </SafeAreaView>
    </TextReaderRoot>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  userInfoSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#757575',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  messageCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    minHeight: 120,
    position: 'relative',
  },
  quoteIconContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  messageText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#fff',
    fontWeight: '500',
  },
  featureGrid: {
    paddingHorizontal: 20,
    flex: 1,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  featureCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  cardBlur: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  primaryCard: {
    width: '48%',
    height: 120,
    backgroundColor: '#FAF3F0',
  },
  secondaryCard: {
    width: '48%',
    height: 120,
    backgroundColor: '#FFFFFF',
  },
  fullWidthCard: {
    width: '100%',
    height: 100,
    marginBottom: 15,
    backgroundColor: '#F8E8E8',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
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
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#FFE6E6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sidePanelProfilePic: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#fff',
  },
  userInfoContainer: {
    marginLeft: 15,
  },
  sidePanelUsername: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sidePanelEmail: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidePanelMenu: {
    padding: 15,
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  },
  logoutIconContainer: {
    backgroundColor: '#FF6B6B',
  },
  sidePanelFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
  },
});

export default HomeScreen;