import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIntroSlider from 'react-native-app-intro-slider';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { markFeatureIntroAsSeen } from '../utils/FeatureIntroUtils';
import IntroImage from './IntroImage';

const { width, height } = Dimensions.get('window');

const FeatureIntroScreen = (props) => {
  // Safely handle props to avoid "Cannot convert undefined value to object" error
  const { 
    slides = [], 
    featureKey = 'feature',
    onComplete = () => {},
    colors = ['#4158D0', '#C850C0'],
  } = props || {};

  // Validate slides is an array to prevent errors
  const validSlides = Array.isArray(slides) ? slides : [];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);

  // Skip button handler
  const handleSkip = () => {
    try {
      console.log(`[FeatureIntro] Skipping ${featureKey} intro`);
      
      // Mark this intro as seen locally
      markFeatureIntroAsSeen(featureKey);
      
      // Call the onComplete callback provided by the parent
      if (typeof onComplete === 'function') {
        onComplete();
      }
    } catch (error) {
      console.error(`[FeatureIntro] Error in handleSkip: ${error.message}`);
    }
  };

  // Done button handler
  const handleDone = () => {
    try {
      console.log(`[FeatureIntro] Completed ${featureKey} intro`);
      
      // Mark this intro as seen locally
      markFeatureIntroAsSeen(featureKey);
      
      // Call the onComplete callback provided by the parent
      if (typeof onComplete === 'function') {
        onComplete();
      }
    } catch (error) {
      console.error(`[FeatureIntro] Error in handleDone: ${error.message}`);
    }
  };

  // Render each slide
  const renderItem = ({ item }) => {
    // Defensive programming to prevent errors from undefined items
    if (!item) {
      console.error('[FeatureIntro] Undefined slide item detected');
      return <View style={styles.slide}></View>;
    }
    
    const { title, description, imageUrl, icon } = item;
    
    return (
      <View style={styles.slide}>
        <View style={styles.iconContainer}>
          {icon && <Icon name={icon} size={24} color="#FFF" />}
        </View>
        
        <View style={styles.imageContainer}>
          <IntroImage 
            source={imageUrl} 
            style={styles.image} 
          />
        </View>
        
        <Text style={styles.title}>{title || ''}</Text>
        <Text style={styles.description}>{description || ''}</Text>
      </View>
    );
  };

  // Custom button component - handles undefined case
  const renderButton = (label, onPress) => {
    if (!label || typeof onPress !== 'function') return null;
    
    return (
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>{label}</Text>
      </TouchableOpacity>
    );
  };

  // Next button
  const renderNextButton = () => renderButton('Next', () => {});

  // Done button
  const renderDoneButton = () => renderButton('Get Started', handleDone);

  // Skip button
  const renderSkipButton = () => renderButton('Skip', handleSkip);

  // Return the intro slider with proper error handling
  try {
    return (
      <LinearGradient colors={colors} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {validSlides.length > 0 ? (
            <AppIntroSlider
              ref={sliderRef}
              data={validSlides}
              renderItem={renderItem}
              onDone={handleDone}
              showSkipButton={true}
              onSkip={handleSkip}
              renderNextButton={renderNextButton}
              renderDoneButton={renderDoneButton}
              renderSkipButton={renderSkipButton}
              onSlideChange={index => setCurrentIndex(index)}
              dotStyle={styles.dot}
              activeDotStyle={styles.activeDot}
            />
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Unable to load introduction slides</Text>
              <TouchableOpacity style={styles.button} onPress={handleSkip}>
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>
    );
  } catch (error) {
    console.error(`[FeatureIntro] Error rendering intro slider: ${error.message}`);
    return (
      <View style={[styles.container, {backgroundColor: '#f8f8f8'}]}>
        <Text style={styles.errorText}>Something went wrong. Please try again later.</Text>
        <TouchableOpacity style={styles.button} onPress={handleSkip}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100, // Space for pagination dots and buttons
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    width: width * 0.7,
    height: height * 0.3,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dot: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  }
});

export default FeatureIntroScreen;
