import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  FlatList, 
  ImageBackground,
  SafeAreaView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

const Scoreboard = ({ navigation }) => {
  const [scores, setScores] = useState([]);
  const [activeTab, setActiveTab] = useState('Easy');
  const [loading, setLoading] = useState(true);

  // Load scores from AsyncStorage
  useEffect(() => {
    loadScores(activeTab);
  }, [activeTab]);

  const loadScores = async (level) => {
    try {
      setLoading(true);
      const scoreKey = `${level.toLowerCase()}Scores`;
      const storedScores = await AsyncStorage.getItem(scoreKey);
      
      if (storedScores) {
        const parsedScores = JSON.parse(storedScores);
        // Sort by score (highest first)
        parsedScores.sort((a, b) => b.score - a.score);
        setScores(parsedScores);
      } else {
        setScores([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading scores:', error);
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  // Handle tab selection
  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  // Clear scores for the current difficulty
  const clearScores = async () => {
    try {
      await AsyncStorage.setItem(`${activeTab.toLowerCase()}Scores`, JSON.stringify([]));
      setScores([]);
    } catch (error) {
      console.error('Error clearing scores:', error);
    }
  };

  // Render each score item
  const renderScoreItem = ({ item, index }) => (
    <View style={styles.scoreItem}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>{index + 1}</Text>
      </View>
      <View style={styles.scoreDetails}>
        <Text style={styles.playerName}>{item.username || 'Player'}</Text>
        <Text style={styles.scoreDate}>{formatDate(item.date)}</Text>
      </View>
      <Text style={styles.scoreValue}>{item.score}</Text>
    </View>
  );

  // Get background image based on level
  const getBackgroundImage = () => {
    switch (activeTab.toLowerCase()) {
      case 'easy':
        return require('../assets/images/wordScramble/easy-background.webp');
      case 'medium':
        return require('../assets/images/wordScramble/medium-background.webp');
      case 'hard':
        return require('../assets/images/wordScramble/hard-background.webp');
      default:
        return require('../assets/images/wordScramble/background.webp');
    }
  };

  // EmptyList component
  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="trophy" size={48} color="#E0B0FF" />
      <Text style={styles.emptyText}>No scores yet!</Text>
      <Text style={styles.emptySubText}>Play a game to set a record</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={getBackgroundImage()} style={styles.backgroundImage}>
        <View style={styles.container}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.title}>Scoreboard</Text>
          
          <View style={styles.tabContainer}>
            {['Easy', 'Medium', 'Hard'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && styles.activeTab,
                  tab === 'Easy' && styles.easyTab,
                  tab === 'Medium' && styles.mediumTab,
                  tab === 'Hard' && styles.hardTab,
                ]}
                onPress={() => handleTabPress(tab)}
              >
                <Text 
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.scoreboardContainer}>
            <View style={styles.scoreHeader}>
              <Text style={styles.headerRank}>Rank</Text>
              <Text style={styles.headerPlayer}>Player</Text>
              <Text style={styles.headerScore}>Score</Text>
            </View>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading scores...</Text>
              </View>
            ) : (
              <FlatList
                data={scores}
                renderItem={renderScoreItem}
                keyExtractor={(item, index) => `score-${index}`}
                ListEmptyComponent={EmptyList}
                style={styles.scoreList}
                contentContainerStyle={scores.length === 0 && styles.emptyListContainer}
              />
            )}
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearScores}
            >
              <Text style={styles.clearButtonText}>Clear {activeTab} Scores</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => navigation.navigate('WordScrambleEntry')}
            >
              <Text style={styles.playButtonText}>Play Game</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  title: {
    fontFamily: 'OpenDyslexic-Bold',
    fontSize: 32,
    color: '#E0B0FF',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  easyTab: {
    backgroundColor: 'rgba(76, 175, 80, 0.5)',
  },
  mediumTab: {
    backgroundColor: 'rgba(33, 150, 243, 0.5)',
  },
  hardTab: {
    backgroundColor: 'rgba(244, 67, 54, 0.5)',
  },
  activeTab: {
    borderColor: 'white',
  },
  tabText: {
    fontFamily: 'OpenDyslexic-Bold',
    fontSize: 16,
    color: 'white',
  },
  activeTabText: {
    fontSize: 18,
  },
  scoreboardContainer: {
    flex: 1,
    backgroundColor: 'rgba(63, 21, 99, 0.8)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  scoreHeader: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#E0B0FF',
    marginBottom: 10,
  },
  headerRank: {
    fontFamily: 'OpenDyslexic-Bold',
    fontSize: 16,
    color: '#E0B0FF',
    width: 50,
    textAlign: 'center',
  },
  headerPlayer: {
    fontFamily: 'OpenDyslexic-Bold',
    fontSize: 16,
    color: '#E0B0FF',
    flex: 1,
  },
  headerScore: {
    fontFamily: 'OpenDyslexic-Bold',
    fontSize: 16,
    color: '#E0B0FF',
    width: 80,
    textAlign: 'right',
  },
  scoreList: {
    flex: 1,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 176, 255, 0.3)',
  },
  rankContainer: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#E0B0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankText: {
    fontFamily: 'OpenDyslexic-Bold',
    fontSize: 16,
    color: '#3F1563',
  },
  scoreDetails: {
    flex: 1,
  },
  playerName: {
    fontFamily: 'OpenDyslexic-Bold',
    fontSize: 16,
    color: 'white',
  },
  scoreDate: {
    fontFamily: 'OpenDyslexic',
    fontSize: 14,
    color: '#d1a7e7',
  },
  scoreValue: {
    fontFamily: 'OpenDyslexic-Bold',
    fontSize: 20,
    color: '#E0B0FF',
    width: 80,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'OpenDyslexic-Bold',
    fontSize: 20,
    color: '#E0B0FF',
    marginTop: 20,
  },
  emptySubText: {
    fontFamily: 'OpenDyslexic',
    fontSize: 16,
    color: '#d1a7e7',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'OpenDyslexic',
    fontSize: 18,
    color: '#d1a7e7',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  clearButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.7)',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    fontFamily: 'OpenDyslexic-Bold',
    fontSize: 16,
    color: 'white',
  },
  playButton: {
    backgroundColor: '#9C27B0',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  playButtonText: {
    fontFamily: 'OpenDyslexic-Bold',
    fontSize: 16,
    color: 'white',
  },
});

export default Scoreboard;