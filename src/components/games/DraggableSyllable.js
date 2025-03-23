import React, { useRef } from 'react';
import { 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Pressable 
} from 'react-native';

const DraggableSyllable = ({ syllable, onPress, textStyle }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View 
        style={[
          styles.syllable,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Text 
          style={[
            styles.syllableText,
            { fontFamily: textStyle?.fontFamily || 'OpenDyslexic-Regular' }
          ]}
        >
          {syllable.text}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  syllable: {
    minWidth: 60,
    height: 60,
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  syllableText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
});

export default DraggableSyllable;
