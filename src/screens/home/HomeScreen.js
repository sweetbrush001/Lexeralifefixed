import React, { useState, useEffect, useRef } from 'react';
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
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../config/firebaseConfig';
// Import TextReaderRoot and ReadableText
import TextReaderRoot from '../../components/TextReaderRoot';
import ReadableText from '../../components/ReadableText';

// Modern icon libraries
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { isUserOnboarded, markUserAsOnboarded } from '../../utils/introService';
import { isNewUser as checkIfNewUser, markFeatureIntroShown } from '../../utils/FeatureIntroUtils';
import { isNewUserInFirebase, hasUserSeenFeatureIntroInFirebase } from '../../utils/userFirebaseUtils';

const { width, height } = Dimensions.get('window');
const PANEL_WIDTH = width * 0.8;

const HomeScreen = ({ route, navigation }) => {
  const [motivationalTexts, setMotivationalTexts] = useState([]);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false); // Start with false default
  
  // Animation value for side panel
  const slideAnim = useRef(new Animated.Value(-PANEL_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Get current user information including profile image from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        try {
          // First set basic user info from auth
          setCurrentUser({
            email: user.email,
            displayName: user.displayName || 'Lexera User',
            photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=random&color=fff&size=256`
          });
          
          // Then fetch additional data from Firestore
          const userDocRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userDocRef);
          
          if (docSnap.exists()) {
            const userData = docSnap.data();
            
            // Update user info with data from Firestore
            setCurrentUser(prev => ({
              ...prev,
              displayName: userData.name || prev.displayName,
              photoURL: userData.profileImage || prev.photoURL
            }));
            
            if (userData.profileImage) {
              setUserProfileImage(userData.profileImage);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    
    fetchUserData();
  }, []);

  // Check if the user has completed onboarding when the component mounts
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const onboarded = await isUserOnboarded();
      setIsFirstTimeUser(!onboarded);
      
      // If this is the first visit after registration, mark as onboarded
      if (!onboarded) {
        await markUserAsOnboarded();
        // Set isNewUser to true if not onboarded yet
        setIsNewUser(true);
      }
    };
    
    checkOnboardingStatus();
  }, []);

  // Check new user status on mount - consolidated with route params check
  useEffect(() => {
    const checkNewUserStatus = async () => {
      try {
        // First priority: check route params (e.g., if coming directly from registration)
        if (route.params?.isNewUser !== undefined) {
          console.log("Setting new user status from navigation params:", route.params.isNewUser);
          setIsNewUser(route.params.isNewUser);
          return;
        }
        
        // Otherwise check Firebase
        const newUserStatus = await isNewUserInFirebase();
        console.log("New user status from Firebase:", newUserStatus);
        setIsNewUser(newUserStatus);
      } catch (error) {
        console.error("Error checking new user status:", error);
        // Default to false on error
        setIsNewUser(false);
      }
    };
    
    checkNewUserStatus();
  }, [route.params?.isNewUser]);

  // Close panel when back button is pressed
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

  // Toggle side panel
  const togglePanel = () => {
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
  };

  // Handle menu item press
  const handleMenuItemPress = (screen) => {
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
  };

  // Fetch motivational texts from Firebase
  const fetchMotivationalTexts = async () => {
    try {
      console.log("Starting to fetch motivational texts...");
      const querySnapshot = await getDocs(collection(db, "motivationalTexts"));
      const texts = [];
      
      querySnapshot.forEach((doc) => {
        console.log("Document data:", doc.data());
        if (doc.data().text) {
          texts.push(doc.data().text);
        }
      });
      
      console.log(`Found ${texts.length} motivational texts`);
      
      if (texts.length > 0) {
        setMotivationalTexts(texts);
      } else {
        // Fallback texts in case Firebase data is empty
        setMotivationalTexts([
          "Believe in yourself! Every great achievement starts with the decision to try.",
          "Don't stop when you're tired. Stop when you're done.",
          "Success comes from what you do consistently.",
          "Stay positive, work hard, make it happen."
        ]);
        console.log("Using fallback motivational texts");
      }
    } catch (error) {
      console.error("Error fetching motivational texts: ", error);
      // Show error alert or fallback to default texts
      Alert.alert("Data Loading Error", "Could not load motivational texts. Using defaults instead.");
      
      // Fallback texts
      setMotivationalTexts([
        "Believe in yourself! Every great achievement starts with the decision to try.",
        "Don't stop when you're tired. Stop when you're done.",
        "Success comes from what you do consistently.",
        "Stay positive, work hard, make it happen."
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchMotivationalTexts();
  }, []);

  // Set up interval to change text every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (motivationalTexts.length > 0) {
        setCurrentTextIndex((prevIndex) => 
          (prevIndex + 1) % motivationalTexts.length
        );
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [motivationalTexts]);

  // Current text to display
  const currentMotivationalText = motivationalTexts[currentTextIndex] || "Loading inspiration...";

  // Generate a profile image URL prioritizing Firestore data
  const getProfileImage = () => {
    if (userProfileImage) {
      return { uri: userProfileImage };
    } else if (currentUser && currentUser.photoURL) {
      return { uri: currentUser.photoURL };
    }
    return require('../../../assets/profilepic.png');
  };

  // Modified navigation handling for features with proper intro logic
  const handleFeatureNavigation = async (featureKey, introRoute, featureRoute) => {
    console.log(`Attempting to navigate to feature: ${featureKey}, intro: ${introRoute}, main: ${featureRoute}`);
    
    // For global new users, always show intros
    if (isNewUser) {
      console.log(`New user navigating to ${introRoute}`);
      navigation.navigate(introRoute);
      return;
    }
    
    try {
      // For returning users, check if they've seen this specific intro
      const hasSeenIntro = await hasUserSeenFeatureIntroInFirebase(featureKey);
      console.log(`User has seen ${featureKey} intro? ${hasSeenIntro}`);
      
      if (hasSeenIntro) {
        console.log(`User has seen ${featureKey} intro, going directly to ${featureRoute}`);
        navigation.navigate(featureRoute);
      } else {
        console.log(`User hasn't seen ${featureKey} intro yet, showing ${introRoute}`);
        navigation.navigate(introRoute);
      }
    } catch (error) {
      console.error(`Error in feature navigation for ${featureKey}:`, error);
      // On error, default to showing the feature
      navigation.navigate(featureRoute);
    }
  };

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
            {/* App title should NOT be read */}
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
        
        {/* User Welcome Section - READ WITH PRIORITY 1 */}
        <View style={styles.welcomeSection}>
          <View style={styles.userInfoSection}>
            {/* Welcome message with highest priority */}
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

        {/* Motivational Card - READ WITH PRIORITY 3 */}
        <LinearGradient
          colors={['#FF9F9F', '#FF6B6B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.messageCard}
        >
          <ReadableText style={styles.messageText} readable={true} priority={3}>
            {loading ? "Loading inspiration..." : currentMotivationalText}
          </ReadableText>
        </LinearGradient>

        {/* Features heading - not read */}
        <ReadableText style={styles.sectionTitle} readable={false}>
          Features
        </ReadableText>
        
        <View style={styles.featureGrid}>
          {/* Row 1 */}
          <View style={styles.featureRow}>
            <TouchableOpacity 
              style={[styles.featureCard, styles.primaryCard]}
              onPress={() => handleFeatureNavigation('chatbot', 'ChatbotIntro', 'Chatbot')}
            >
              <BlurView intensity={10} style={styles.cardBlur}>
                <MaterialCommunityIcons name="robot" size={28} color="#FF6B6B" />
                {/* Feature 1 - READ WITH PRIORITY 4 */}
                <ReadableText style={styles.featureTitle} readable={true} priority={4}>
                  Lexera Bot
                </ReadableText>
              </BlurView>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.featureCard, styles.secondaryCard]}
              onPress={() => handleFeatureNavigation('game', 'GameIntro', 'Game')}
            >
              <BlurView intensity={10} style={styles.cardBlur}>
                <MaterialCommunityIcons name="brain" size={28} color="#FF6B6B" />
                {/* Feature 2 - READ WITH PRIORITY 5 */}
                <ReadableText style={styles.featureTitle} readable={true} priority={5}>
                  Brain Training
                </ReadableText>
              </BlurView>
            </TouchableOpacity>
          </View>
          
          {/* Row 2 */}
          <View style={styles.featureRow}>
            <TouchableOpacity 
              style={[styles.featureCard, styles.secondaryCard]}
              onPress={() => handleFeatureNavigation('test', 'TestIntroIntro', 'Teststarting')}
            >
              <BlurView intensity={10} style={styles.cardBlur}>
                <Feather name="clipboard" size={28} color="#FF6B6B" />
                {/* Feature 3 - READ WITH PRIORITY 6 */}
                <ReadableText style={styles.featureTitle} readable={true} priority={6}>
                  Dyslexia Test
                </ReadableText>
              </BlurView>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.featureCard, styles.primaryCard]}
              onPress={() => handleFeatureNavigation('relax', 'RelaxIntro', 'Relax')}
            >
              <BlurView intensity={10} style={styles.cardBlur}>
                <Feather name="heart" size={28} color="#FF6B6B" />
                {/* Feature 4 - READ WITH PRIORITY 7 */}
                <ReadableText style={styles.featureTitle} readable={true} priority={7}>
                  Relax
                </ReadableText>
              </BlurView>
            </TouchableOpacity>
          </View>
          
          {/* Community Card (Full Width) */}
          <TouchableOpacity 
            style={[styles.featureCard, styles.fullWidthCard]}
            onPress={() => handleFeatureNavigation('community', 'CommunityIntro', 'Community')}
          >
            <BlurView intensity={10} style={styles.cardBlur}>
              <Feather name="users" size={28} color="#FF6B6B" />
              {/* Feature 5 - READ WITH PRIORITY 8 */}
              <ReadableText style={styles.featureTitle} readable={true} priority={8}>
                Community
              </ReadableText>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Overlay when panel is open */}
        <Animated.View 
          style={[
            styles.overlay,
            { 
              opacity: overlayOpacity,
              pointerEvents: isPanelOpen ? 'auto' : 'none'
            }
          ]} 
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={togglePanel}
          />
        </Animated.View>

        {/* Side Panel - NOTHING HERE SHOULD BE READ */}
        <Animated.View 
          style={[
            styles.sidePanel,
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          <BlurView intensity={30} style={styles.sidePanelContent}>
            <View style={styles.sidePanelHeader}>
              <View style={styles.profileSection}>
                <Image
                  source={getProfileImage()}
                  style={styles.sidePanelProfilePic}
                />
                <View style={styles.userInfoContainer}>
                  <Text style={styles.sidePanelUsername}>
                    {currentUser ? currentUser.displayName : 'Loading...'}
                  </Text>
                  <Text style={styles.sidePanelEmail}>
                    {currentUser ? currentUser.email : ''}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={togglePanel}
              >
                <Feather name="x" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            {/* All menu items are not readable - using Text instead of ReadableText */}
            <View style={styles.sidePanelMenu}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleMenuItemPress('profile')}
              >
                <View style={styles.menuIconContainer}>
                  <Feather name="user" size={20} color="#FF6B6B" />
                </View>
                <Text style={styles.menuItemText}>Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleMenuItemPress('settings')}
              >
                <View style={styles.menuIconContainer}>
                  <Feather name="settings" size={20} color="#FF6B6B" />
                </View>
                <Text style={styles.menuItemText}>Settings</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleMenuItemPress('feedback')}
              >
                <View style={styles.menuIconContainer}>
                  <Feather name="message-square" size={20} color="#FF6B6B" />
                </View>
                <Text style={styles.menuItemText}>Feedback</Text>
              </TouchableOpacity>
              
              <View style={styles.divider} />
              
              <TouchableOpacity 
                style={[styles.menuItem, styles.logoutItem]}
                onPress={() => handleMenuItemPress('Auth')}
              >
                <View style={[styles.menuIconContainer, styles.logoutIconContainer]}>
                  <Feather name="log-out" size={20} color="#fff" />
                </View>
                <Text style={styles.menuItemText}>Logout</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.sidePanelFooter}>
              <Text style={styles.versionText}>Lexera Life v1.0.2</Text>
              <Text style={styles.copyrightText}>© 2025 Lexera Life</Text>
            </View>
          </BlurView>
        </Animated.View>
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