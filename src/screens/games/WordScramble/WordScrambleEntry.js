import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const WordScrambleEntry = ({ navigation }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
  };

  const startGame = () => {
    if (selectedLevel) {
      navigation.navigate('WordScrambleGame', { level: selectedLevel });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground 
        source={require('../assets/images/wordScramble/background.webp')} 
        style={styles.backgroundImage}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.content}>
              <Text style={styles.title}>Word Scramble</Text>
              <Text style={styles.subtitle}>Unscramble words in Outerspace</Text>
              
              <View style={styles.levelSelectionContainer}>
                            
                <TouchableOpacity
                  style={[
                    styles.levelButton,
                    styles.easyButton,
                    selectedLevel === 'Easy' && styles.selectedButton
                  ]}
                  onPress={() => handleLevelSelect('Easy')}
                >
                  <Text style={styles.levelButtonText}>Easy</Text>
                  
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.levelButton,
                    styles.mediumButton,
                    selectedLevel === 'Medium' && styles.selectedButton
                  ]}
                  onPress={() => handleLevelSelect('Medium')}
                >
                  <Text style={styles.levelButtonText}>Medium</Text>
                 
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.levelButton,
                    styles.hardButton,
                    selectedLevel === 'Hard' && styles.selectedButton
                  ]}
                  onPress={() => handleLevelSelect('Hard')}
                >
                  <Text style={styles.levelButtonText}>Hard</Text>
                  
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.startButton,
                  !selectedLevel && styles.disabledButton
                ]}
                onPress={startGame}
                disabled={!selectedLevel}
              >
                <Text style={styles.startButtonText}>Start Game</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.scoreboardButton}
                onPress={() => navigation.navigate('Scoreboard')}
              >
                <Text style={styles.scoreboardButtonText}>View Scoreboard</Text>
              </TouchableOpacity>
              
              
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  title: {
    fontFamily: 'OpenDyslexic-Bold',
    fontSize: 32,
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'OpenDyslexic',
    fontSize: 18,
    color: '#d1a7e7',
    marginBottom: 30,
    textAlign: 'center',
  },
  levelSelectionContainer: {
    width: '100%',
    marginBottom: 20,
  },
  selectText: {
    fontFamily: 'OpenDyslexic-Bold',
    fontSize: 20,
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  levelButton: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center',
    width: '100%',
  },
  easyButton: {
    backgroundColor: '#4CAF50',
  },
  mediumButton: {
    backgroundColor: '#2196F3',
  },
  hardButton: {
    backgroundColor: '#F44336',
  },
  selectedButton: {
    borderWidth: 3,
    borderColor: 'white',
  },
  levelButtonText: {
    fontFamily: 'OpenDyslexic-Bold',
    fontSize: 20,
    color: 'white',
    textAlign: 'center', 
  },
  levelDescription: {
    fontFamily: 'OpenDyslexic',
    fontSize: 14,
    color: 'white',
  },
  startButton: {
    backgroundColor: '#9C27B0',
    padding: 18,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#9C27B080',
  },
  startButtonText: {
    fontFamily: 'OpenDyslexic-Bold',
    fontSize: 20,
    color: 'white',
  },
  scoreboardButton: {
    backgroundColor: 'transparent',
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0B0FF',
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreboardButtonText: {
    fontFamily: 'OpenDyslexic',
    fontSize: 16,
    color: '#E0B0FF',
  },
  rulesContainer: {
    backgroundColor: 'rgba(63, 21, 99, 0.7)',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginTop: 10,
  },
  rulesTitle: {
    fontFamily: 'OpenDyslexic-Bold',
    fontSize: 18,
    color: '#E0B0FF',
    marginBottom: 10,
  },
  rulesText: {
    fontFamily: 'OpenDyslexic',
    fontSize: 14,
    color: 'white',
    marginBottom: 5,
  },
});

export default WordScrambleEntry;