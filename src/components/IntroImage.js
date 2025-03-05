import React, { useState, useEffect } from 'react';
import { Image, View, ActivityIndicator, StyleSheet, Text } from 'react-native';

// Default placeholder image URL - using a public CDN image for reliability
const DEFAULT_IMAGE = 'https://via.placeholder.com/400/6c5ce7/FFFFFF?text=Lexera';

/**
 * A component to display images in intro slides with loading state and error handling
 */
const IntroImage = ({ source, style }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [imageSource, setImageSource] = useState(null);

  // Set up image source with error handling
  useEffect(() => {
    // Reset states when source changes
    setIsLoading(true);
    setHasError(false);
    
    // Determine the image source
    if (!source) {
      console.warn('No image source provided, using default');
      setImageSource({ uri: DEFAULT_IMAGE });
      setIsLoading(false);
    } else if (typeof source === 'string') {
      setImageSource({ uri: source });
    } else {
      // If it's an object (like a require'd image), use it directly
      setImageSource(source);
    }
  }, [source]);

  // Handle image load complete
  const handleLoadEnd = () => {
    console.log('Image loaded successfully');
    setIsLoading(false);
  };

  // Handle image load error
  const handleError = () => {
    console.warn(`Failed to load image: ${typeof source === 'string' ? source : 'Object'}`);
    
    // If we've retried less than 2 times, try again with increased timeout
    if (retryCount < 2) {
      setRetryCount(prev => prev + 1);
      setTimeout(() => {
        console.log(`Retrying image load (attempt ${retryCount + 1})`);
        // Force refresh by changing a key
        setImageSource(prev => {
          if (prev && prev.uri) {
            return { 
              ...prev, 
              uri: prev.uri.includes('?') 
                ? `${prev.uri}&retry=${retryCount}` 
                : `${prev.uri}?retry=${retryCount}` 
            };
          }
          return { uri: DEFAULT_IMAGE };
        });
      }, 1000 * (retryCount + 1)); // Increasingly longer retry delays
    } else {
      // After retries, fall back to default
      setHasError(true);
      setImageSource({ uri: DEFAULT_IMAGE });
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color="#ffffff" 
            style={styles.loader} 
          />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {imageSource && (
        <Image
          source={imageSource}
          style={[styles.image, isLoading ? { opacity: 0.3 } : null]}
          resizeMode="contain"
          onLoadEnd={handleLoadEnd}
          onError={handleError}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loader: {
    marginBottom: 8,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 12,
  }
});

export default IntroImage;
