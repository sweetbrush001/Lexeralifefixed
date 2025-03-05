import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FeatureIntroScreen from '../../components/FeatureIntroScreen';

// Use online images instead of Lottie animations
const relaxSlides = [
  {
    id: '1',
    title: 'Find Your Calm',
    description: 'Welcome to the Relax zone, your personal sanctuary for peace and mindfulness.',
    imageUrl: 'https://img.freepik.com/free-vector/organic-flat-meditation-concept_52683-36532.jpg',
    icon: 'spa'
  },
  {
    id: '2',
    title: 'Soothing Sounds',
    description: 'Discover a collection of calming audio tracks designed to help you relax, focus, or sleep better.',
    imageUrl: 'https://img.freepik.com/free-vector/sound-wave-with-imitation-sound-audio-identification-technology_53562-9325.jpg',
    icon: 'headphones'
  },
  {
    id: '3',
    title: 'Set Your Timer',
    description: 'Create the perfect relaxation session with customizable timers. Your audio will automatically stop when the time is up.',
    imageUrl: 'https://img.freepik.com/free-vector/flat-design-time-management-concept_52683-64399.jpg',
    icon: 'clock'
  },
];

const RelaxIntroScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.navigate('Home');
        return true;
      }
    );

    return () => backHandler.remove();
  }, [navigation]);

  const handleComplete = () => {
    navigation.navigate('Relax');
  };

  return (
    <FeatureIntroScreen
      slides={relaxSlides}
      featureKey="relax"
      onComplete={handleComplete}
      colors={['#FF9999', '#FF5E62']} // Pink/Red theme matching relax screen
    />
  );
};

export default RelaxIntroScreen;
