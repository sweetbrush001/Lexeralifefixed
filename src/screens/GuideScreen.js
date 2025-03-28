import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTextStyle } from '../hooks/useTextStyle';

const { width } = Dimensions.get('window');

// Fix: Ensure we're properly handling the case where fontStyle might be undefined
const FeatureCard = ({ icon, title, description, color, fontStyle = {} }) => (
  <View style={[styles.featureCard, { backgroundColor: color }]}>
    <View style={styles.featureIconContainer}>
      <Ionicons name={icon} size={32} color="#FFFFFF" />
    </View>
    <Text style={[styles.featureCardTitle, fontStyle]}>{title || ''}</Text>
    <Text style={[styles.featureCardDescription, fontStyle]}>{description || ''}</Text>
  </View>
);

// Fix: Ensure we're properly handling the case where fontStyle might be undefined
const TipItem = ({ tip, icon, fontStyle = {} }) => (
  <View style={styles.tipItem}>
    <View style={styles.tipIconBackground}>
      <Ionicons name={icon} size={22} color="#FFFFFF" />
    </View>
    <Text style={[styles.tipText, fontStyle]}>{tip || ''}</Text>
  </View>
);

const GuideScreen = () => {
  const navigation = useNavigation();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  const textStyleSettings = useTextStyle();
  const fontStyle = useMemo(() => {
    const { fontFamily } = textStyleSettings || {};
    return { fontFamily };
  }, [textStyleSettings]);

  const handleContinue = () => {
    navigation.navigate('Home');
  };

  const headerImageUrl = "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1332&auto=format&fit=crop";
  const galleryImages = [
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1373&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1422&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=1470&auto=format&fit=crop"
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Enhanced Header with Orange Gradient */}
        <LinearGradient
          colors={['#FF9F9F', '#FF6B6B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Ionicons name="book" size={28} color="#FFFFFF" style={styles.logoIcon} />
              {/* Fix: Ensure we're passing valid text */}
              <Text style={[styles.title, fontStyle]}>{'LexeraLife'}</Text>
            </View>
            {/* Fix: Ensure we're passing valid text */}
            <Text style={[styles.subtitle, fontStyle]}>{'Empowering your dyslexia journey'}</Text>
            
            <Image 
              source={{ uri: headerImageUrl }} 
              style={styles.headerIllustration}
              resizeMode="cover"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
            
            {imageLoading && (
              <View style={styles.imageLoadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            )}
            
            {imageError && (
              <View style={styles.errorContainer}>
                <Ionicons name="image-outline" size={40} color="#FFFFFF" />
                {/* Fix: Ensure we're passing valid text */}
                <Text style={[styles.errorText, fontStyle]}>{'Image not available'}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.curvedEdge} />
        </LinearGradient>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          {/* Fix: Ensure we're passing valid text */}
          <Text style={[styles.welcomeTitle, fontStyle]}>{'Welcome to LexeraLife'}</Text>
          <Text style={[styles.welcomeDescription, fontStyle]}>
            {'Our app is specifically designed to assist those with dyslexia in improving their cognitive skills, learning, and well-being through specialized tools, customizable features, and an inclusive learning environment.'}
          </Text>
        </View>

        {/* Features Grid Section with improved orange colors */}
        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, fontStyle]}>{'Key Features'}</Text>
          
          <View style={styles.featuresGrid}>
            <FeatureCard 
              icon="chatbubble-ellipses" 
              title="LexeraBot" 
              description="AI assistant for instant help & practice"
              color="#FF7F50"
              fontStyle={fontStyle}
            />
            
            <FeatureCard 
              icon="game-controller" 
              title="Brain Games" 
              description="Mini-games to improve cognitive skills"
              color="#FF8C61"
              fontStyle={fontStyle}
            />
            
            <FeatureCard 
              icon="clipboard" 
              title="Screening Test" 
              description="dyslexia recognising test"
              color="#FF9F72"
              fontStyle={fontStyle}
            />
            
            <FeatureCard 
              icon="people" 
              title="Community" 
              description="Connect with supportive peers"
              color="#FFB183"
              fontStyle={fontStyle}
            />
          </View>
        </View>
        
        {/* Enhanced Image Gallery with Cards */}
        <View style={styles.gallerySection}>
          <Text style={[styles.sectionTitle, fontStyle]}>How We Support You</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.galleryScroll}
            contentContainerStyle={styles.galleryScrollContent}
          >
            <View style={styles.galleryCard}>
              <Image 
                source={{uri: galleryImages[0]}}
                style={styles.galleryImage}
                resizeMode="cover"
              />
              <View style={styles.galleryCardContent}>
                <Text style={[styles.galleryCardTitle, fontStyle]}>Relaxation</Text>
                <Text style={[styles.galleryCardDescription, fontStyle]}>Calming music to reduce stress and improve focus</Text>
              </View>
            </View>
            
            <View style={styles.galleryCard}>
              <Image 
                source={{uri: galleryImages[1]}}
                style={styles.galleryImage}
                resizeMode="cover"
              />
              <View style={styles.galleryCardContent}>
                <Text style={[styles.galleryCardTitle, fontStyle]}>Text-to-Speech</Text>
                <Text style={[styles.galleryCardDescription, fontStyle]}>Listen to any text for easier reading</Text>
              </View>
            </View>
            
            <View style={styles.galleryCard}>
              <Image 
                source={{uri: galleryImages[2]}}
                style={styles.galleryImage}
                resizeMode="cover"
              />
              <View style={styles.galleryCardContent}>
                <Text style={[styles.galleryCardTitle, fontStyle]}>Customizable UI</Text>
                <Text style={[styles.galleryCardDescription, fontStyle]}>Personalize your experience with adjustable fonts and colors</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Enhanced Tips Card */}
        <View style={styles.tipsCard}>
          <LinearGradient
            colors={['rgba(255, 159, 159, 0.15)', 'rgba(255, 107, 107, 0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tipsGradient}
          >
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={24} color="#FF6B6B" />
              <Text style={[styles.tipsTitle, fontStyle]}>Dyslexia-Friendly Design</Text>
            </View>
            
            <TipItem 
              icon="text" 
              tip="OpenDyslexic font"
              fontStyle={fontStyle}
            />
            
            <TipItem 
              icon="resize" 
              tip="Adjustable text size"
              fontStyle={fontStyle}
            />
            
            <TipItem 
              icon="color-palette" 
              tip="Customizable colours to reduce visual stress"
              fontStyle={fontStyle}
            />
            
            <TipItem 
              icon="headset" 
              tip="Text-to-speech "
              fontStyle={fontStyle}
            />
          </LinearGradient>
        </View>
        
        {/* Enhanced Testimonial Section */}
        <View style={styles.testimonialSection}>
          <View style={styles.testimonialCard}>
            <Ionicons name="chatbox" size={24} color="#FF6B6B" style={styles.quoteIcon} />
            <Text style={[styles.testimonialQuote, fontStyle]}>
              "Lexera Life has transformed how I interact with text. Reading feels so much more natural now, and I've gained confidence in school!"
            </Text>
            <View style={styles.testimonialAuthorContainer}>
              <View style={[styles.testimonialAvatar, {backgroundColor: '#FF6B6B'}]}>
                <Text style={[styles.testimonialAvatarText, fontStyle]}>S</Text>
              </View>
              <View>
                <Text style={[styles.testimonialAuthorName, fontStyle]}>Sarah</Text>
                <Text style={[styles.testimonialAuthorAge, fontStyle]}>14 years old</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Enhanced Footer with Gradient Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.continueButtonContainer}
          onPress={handleContinue}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#FF9F9F', '#FF6B6B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueButton}
          >
            {/* Fix: Ensure we're passing valid text */}
            <Text style={[styles.continueButtonText, fontStyle]}>{'Start Your Journey'}</Text>
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  headerGradient: {
    paddingTop: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  headerIllustration: {
    width: width * 0.85,
    height: 200,
    borderRadius: 16,
    marginTop: 5,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  imageLoadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  errorContainer: {
    position: 'absolute',
    top: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
  },
  curvedEdge: {
    backgroundColor: '#FFFFFF',
    height: 50,
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  welcomeSection: {
    padding: 24,
    paddingTop: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 12,
  },
  welcomeDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555555',
    letterSpacing: 0.3,
  },
  featuresSection: {
    padding: 24,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureCardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureCardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  gallerySection: {
    paddingTop: 8,
    paddingHorizontal: 24,
  },
  galleryScroll: {
    marginTop: 16,
    paddingBottom: 16,
  },
  galleryScrollContent: {
    paddingRight: 24,
  },
  galleryCard: {
    width: width * 0.7,
    marginLeft: 5,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginRight: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  galleryImage: {
    width: '100%',
    height: 160,
  },
  galleryCardContent: {
    padding: 16,
  },
  galleryCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  galleryCardDescription: {
    fontSize: 14,
    color: '#666666',
  },
  tipsCard: {
    margin: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipsGradient: {
    padding: 24,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginLeft: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipIconBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tipText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
    letterSpacing: 0.3,
  },
  testimonialSection: {
    padding: 24,
    paddingTop: 0,
  },
  testimonialCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quoteIcon: {
    marginBottom: 12,
  },
  testimonialQuote: {
    fontSize: 17,
    color: '#555555',
    fontStyle: 'italic',
    lineHeight: 26,
  },
  testimonialAuthorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  testimonialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5E60CE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  testimonialAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  testimonialAuthorName: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  testimonialAuthorAge: {
    fontSize: 14,
    color: '#666666',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    elevation: 5,
  },
  continueButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  continueButton: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  }
});

export default GuideScreen;