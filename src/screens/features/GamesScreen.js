import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// Import TextReaderRoot and ReadableText for accessibility
import TextReaderRoot from '../../components/TextReaderRoot';
import ReadableText from '../../components/ReadableText';

// Import useTextStyle hook for applying text styling from settings
import { useTextStyle } from '../../hooks/useTextStyle';

// Import useSettings hook for accessing font settings
import { useSettings } from '../../context/SettingsContext';

const { width } = Dimensions.get('window');

const GamesScreen = () => {
  const navigation = useNavigation();
  const textStyle = useTextStyle();
  
  // Get settings from context
  const { settings } = useSettings();
  
  // Create font style object based on settings
  const fontStyle = {
    fontFamily: settings.isDyslexicFriendly ? 'OpenDyslexic-Regular' : undefined,
  };

  return (
    <TextReaderRoot>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Feather name="arrow-left" size={24} color="#ff846b" />
          </TouchableOpacity>
          <ReadableText style={[styles.headerTitle, fontStyle]} readable={true} priority={1}>
            Brain Training Games
          </ReadableText>
          <View style={styles.placeholder} />
        </View>

        {/* Introduction Card */}
        <LinearGradient
          colors={['#FF9F9F', '#FF6B6B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.introCard}
        >
          <ReadableText style={[styles.introText, fontStyle]} readable={true} priority={2}>
            Train your brain with fun games designed to improve cognitive skills and help with dyslexia.
          </ReadableText>
        </LinearGradient>

        <ReadableText style={[styles.sectionTitle, fontStyle]} readable={true} priority={3}>
          Available Games
        </ReadableText>

        <ScrollView 
          style={styles.gamesContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Word Builder Game Card */}
          <TouchableOpacity 
            style={styles.gameCard}
            onPress={() => navigation.navigate('PhonicsGame')}
          >
            <BlurView intensity={10} style={styles.cardBlur}>
              <View style={styles.gameCardContent}>
                <View style={styles.gameIconContainer}>
                  <MaterialCommunityIcons name="island" size={32} color="#F7D08A" />
                </View>
                <View style={styles.gameInfo}>
                  <ReadableText style={[styles.gameTitle, fontStyle]} readable={true} priority={4}>
                    Pirate Phonics
                  </ReadableText>
                  <ReadableText style={[styles.gameDescription, fontStyle]} readable={true} priority={5}>
                    Select words by listening to the sounds.
                  </ReadableText>
                </View>
              </View>
            </BlurView>
          </TouchableOpacity>

          {/* Memory Match Game Card */}
          <TouchableOpacity 
            style={styles.gameCard}
            onPress={() => navigation.navigate('MemoryMatchGame')}
          >
            <BlurView intensity={10} style={styles.cardBlur}>
              <View style={styles.gameCardContent}>
                <View style={styles.gameIconContainer}>
                  <MaterialCommunityIcons name="cards" size={32} color="#D8BFD8" />
                </View>
                <View style={styles.gameInfo}>
                  <ReadableText style={[styles.gameTitle, fontStyle]} readable={true} priority={6}>
                    Memory Match
                  </ReadableText>
                  <ReadableText style={[styles.gameDescription, fontStyle]} readable={true} priority={7}>
                    Test your memory by matching pairs of cards.
                  </ReadableText>
                </View>
              </View>
            </BlurView>
          </TouchableOpacity>

          {/* Letter Recognition Game Card */}
          <TouchableOpacity 
            style={styles.gameCard}
            onPress={() => navigation.navigate('SpellingGame')}
          >
            <BlurView intensity={10} style={styles.cardBlur}>
              <View style={styles.gameCardContent}>
                <View style={styles.gameIconContainer}>
                  <MaterialCommunityIcons name="forest" size={32} color="#A3D9A5" />
                </View>
                <View style={styles.gameInfo}>
                  <ReadableText style={[styles.gameTitle, fontStyle]} readable={true} priority={8}>
                    Jungle Spelling 
                  </ReadableText>
                  <ReadableText style={[styles.gameDescription, fontStyle]} readable={true} priority={9}>
                    Practice spelling with animals.
                  </ReadableText>
                </View>
              </View>
            </BlurView>
          </TouchableOpacity>

          {/* Spelling Challenge Game Card */}
          <TouchableOpacity 
            style={styles.gameCard}
            onPress={() => navigation.navigate('SpellingChallengeGame')}
          >
            <BlurView intensity={10} style={styles.cardBlur}>
              <View style={styles.gameCardContent}>
                <View style={styles.gameIconContainer}>
                  <MaterialCommunityIcons name="text-box" size={32} color="#FFD8B1" />
                </View>
                <View style={styles.gameInfo}>
                  <ReadableText style={[styles.gameTitle, fontStyle]} readable={true} priority={10}>
                    Spelling Challenge
                  </ReadableText>
                  <ReadableText style={[styles.gameDescription, fontStyle]} readable={true} priority={11}>
                    Test and improve your spelling skills with fun challenges.
                  </ReadableText>
                </View>
              </View>
            </BlurView>
          </TouchableOpacity>

          {/* Pattern Match Game Card */}
          <TouchableOpacity 
            style={styles.gameCard}
            onPress={() => navigation.navigate('PatternMatchGame')}
          >
            <BlurView intensity={10} style={styles.cardBlur}>
              <View style={styles.gameCardContent}>
                <View style={styles.gameIconContainer}>
                  <MaterialCommunityIcons name="view-grid" size={32} color="#fcef95" />
                </View>
                <View style={styles.gameInfo}>
                  <ReadableText style={[styles.gameTitle, fontStyle]} readable={true} priority={12}>
                    Pattern Match
                  </ReadableText>
                  <ReadableText style={[styles.gameDescription, fontStyle]} readable={true} priority={13}>
                    Improve cognitive skills by identifying patterns and sequences.
                  </ReadableText>
                </View>
              </View>
            </BlurView>
          </TouchableOpacity>
          
          {/* Word Flow Game Card */}
          <TouchableOpacity 
            style={styles.gameCard}
            onPress={() => navigation.navigate('WordFlowGame')}
          >
            <BlurView intensity={10} style={styles.cardBlur}>
              <View style={styles.gameCardContent}>
                <View style={styles.gameIconContainer}>
                  <MaterialCommunityIcons name="brain" size={32} color="#C3B1E1" />
                </View>
                <View style={styles.gameInfo}>
                  <ReadableText style={[styles.gameTitle, fontStyle]} readable={true} priority={14}>
                    Word Flow
                  </ReadableText>
                  <ReadableText style={[styles.gameDescription, fontStyle]} readable={true} priority={15}>
                    Advanced brain training with word associations and cognitive challenges.
                  </ReadableText>
                </View>
              </View>
            </BlurView>
          </TouchableOpacity>

          {/* Word Scramble Game Card */}
          <TouchableOpacity 
            style={styles.gameCard}
            onPress={() => navigation.navigate('WordScrambleEntry')}
          >
            <BlurView intensity={10} style={styles.cardBlur}>
              <View style={styles.gameCardContent}>
                <View style={styles.gameIconContainer}>
                  <MaterialCommunityIcons name="shuffle-variant" size={32} color="#FFCCD2" />
                </View>
                <View style={styles.gameInfo}>
                  <ReadableText style={[styles.gameTitle, fontStyle]} readable={true} priority={16}>
                    Word Scramble
                  </ReadableText>
                  <ReadableText style={[styles.gameDescription, fontStyle]} readable={true} priority={17}>
                    Unscramble jumbled words to improve vocabulary and spelling skills.
                  </ReadableText>
                </View>
              </View>
            </BlurView>
          </TouchableOpacity>

          {/* Ocean Spelling Game Card */}
          <TouchableOpacity 
            style={styles.gameCard}
            onPress={() => navigation.navigate('OceanSpellingGame')}
          >
            <BlurView intensity={10} style={styles.cardBlur}>
              <View style={styles.gameCardContent}>
                <View style={styles.gameIconContainer}>
                  <MaterialCommunityIcons name="jellyfish" size={32} color="#AEC6CF" />
                </View>
                <View style={styles.gameInfo}>
                  <ReadableText style={[styles.gameTitle, fontStyle]} readable={true} priority={18}>
                    Ocean Spelling
                  </ReadableText>
                  <ReadableText style={[styles.gameDescription, fontStyle]} readable={true} priority={19}>
                    Learn to spell ocean-themed words with visual cues and interactive challenges.
                  </ReadableText>
                </View>
              </View>
            </BlurView>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </TextReaderRoot>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ccdafc',
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
  backButton: {
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
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 44,
  },
  introCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  introText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#fff',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 15,
  },
  gamesContainer: {
    paddingHorizontal: 20,
    flex: 1,
  },
  gameCard: {
    width: '100%',
    borderRadius: 20, // Increased from 20 to 30 for more rounded corners
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardBlur: {
    padding: 24, // Increased from 20 to 24 for more interior spacing
  },
  gameCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff8f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  gameDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default GamesScreen;