import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  FlatList,
  BackHandler,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { markFeatureIntroAsSeen } from '../utils/FeatureIntroUtils';
import { markFeatureIntroAsSeenInFirebase } from '../utils/userFirebaseUtils';

const { width, height } = Dimensions.get('window');

const FeatureIntroScreen = ({ 
  slides, 
  featureKey, 
  onComplete, 
  colors = ['#a990ff', '#6b66ff']
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationErrors, setAnimationErrors] = useState({});
  const flatListRef = useRef();
  const scrollX = useRef(new Animated.Value(0)).current;
  
  const viewConfig = { viewAreaCoveragePercentThreshold: 50 };
  
  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;
  
  const scrollTo = (index) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index });
    }
  };
  
  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollTo(currentIndex + 1);
    } else {
      markFeatureAsSeen();
    }
  };

  const markFeatureAsSeen = async () => {
    try {
      console.log(`[FeatureIntro] User completed intro for ${featureKey}`);
      
      // Mark this feature as seen in Firebase
      await markFeatureIntroAsSeenInFirebase(featureKey);
      
      // Continue with navigation
      onComplete();
    } catch (error) {
      console.error(`[FeatureIntro] Error in markFeatureAsSeen for ${featureKey}:`, error);
      // Still continue even if Firebase operation fails
      onComplete();
    }
  };

  const handleSkip = async () => {
    console.log(`[FeatureIntro] User skipped intro for ${featureKey}`);
    await markFeatureAsSeen();
  };

  React.useEffect(() => {
    const handleBackButton = () => {
      console.log(`[FeatureIntro] Back button pressed in ${featureKey} intro`);
      markFeatureAsSeen();
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => subscription.remove();
  }, [featureKey]);

  React.useEffect(() => {
    return () => {
      console.log(`[FeatureIntro] Component unmounting for ${featureKey}`);
      markFeatureIntroAsSeen(featureKey).catch(err => 
        console.error(`[FeatureIntro] Error marking ${featureKey} as seen on unmount:`, err)
      );
    };
  }, [featureKey]);

  const handleAnimationError = (itemId) => {
    setAnimationErrors(prev => ({
      ...prev,
      [itemId]: true
    }));
  };
  
  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        {item.lottieUrl && !animationErrors[item.id] ? (
          <LottieView
            source={{ uri: item.lottieUrl }}
            autoPlay
            loop
            style={styles.lottieImage}
            onError={() => handleAnimationError(item.id)}
          />
        ) : (
          <View style={styles.iconContainer}>
            <Icon name={item.icon || "lightbulb"} size={80} color={colors[0]} />
          </View>
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  const Indicator = ({ scrollX }) => {
    return (
      <View style={styles.indicatorContainer}>
        {slides.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];
          
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.4, 0.8],
            extrapolate: 'clamp',
          });
          
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });
          
          return (
            <Animated.View
              key={`indicator-${index}`}
              style={[
                styles.indicator,
                {
                  transform: [{ scale }],
                  opacity,
                  backgroundColor: currentIndex === index ? colors[0] : '#ccc',
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#ffffff', '#f8f8ff']}
      style={styles.container}
    >
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={32}
      />
      
      <Indicator scrollX={scrollX} />
      
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.nextButton}
      >
        <TouchableOpacity onPress={handleNext}>
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Icon 
              name={currentIndex === slides.length - 1 ? 'check' : 'arrow-right'} 
              size={16} 
              color="#fff" 
              style={styles.buttonIcon} 
            />
          </View>
        </TouchableOpacity>
      </LinearGradient>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.8,
    height: height * 0.4,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  lottieImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 0.4,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  indicator: {
    height: 10,
    width: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  nextButton: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    marginBottom: 50,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 10,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    zIndex: 10,
  },
  skipText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FeatureIntroScreen;
