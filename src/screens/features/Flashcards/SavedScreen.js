import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
  Modal,
  TextInput,
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import Flashcard from "./Flashcard";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSavedFlashcards, removeFlashcard, clearFlashcards } from "./storage";

const COLORS = {
  primary: "#6200ee",
  background: "#f8f8f8",
  card: "#ffffff",
  text: "#333333",
  border: "#e0e0e0",
  error: "#f44336",
  shadow: "rgba(0,0,0,0.1)",
};

const CARD_HEIGHT = 180;
const STACK_OFFSET = 5;
const screenWidth = Dimensions.get('window').width;
const FLASHCARDS_KEY = 'flashcards';

export default function SavedScreen({ setActiveTab, setFlashcards, setTimer }) {
  const [collections, setCollections] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [expandedCollection, setExpandedCollection] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [animation] = useState(new Animated.Value(0));
  const [modalVisible, setModalVisible] = useState(false);
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState([]);
  const [timerMinutes, setTimerMinutes] = useState('');
  const [timerSeconds, setTimerSeconds] = useState('');

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      setLoading(true);
      const savedFlashcards = await getSavedFlashcards();
      
      const groupedCollections = savedFlashcards.reduce((acc, card) => {
        const subtopic = card.subtopic || 'Uncategorized';
        if (!acc[subtopic]) acc[subtopic] = [];
        acc[subtopic].push(card);
        return acc;
      }, {});

      setCollections(groupedCollections);
      setError("");
    } catch (err) {
      setError("Failed to load flashcard collections. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleCollection = (subtopic) => {
    setExpandedCollection(expandedCollection === subtopic ? null : subtopic);
    setExpandedCard(null);
    
    Animated.spring(animation, {
      toValue: expandedCollection === subtopic ? 0 : 1,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();
  };

  const handleDelete = async (id, subtopic) => {
    Alert.alert(
      "Delete Flashcard",
      "Are you sure you want to delete this flashcard?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await removeFlashcard(id);
              setCollections(prev => {
                const updatedCards = prev[subtopic].filter(card => card.id !== id);
                if (updatedCards.length === 0) {
                  const { [subtopic]: _, ...rest } = prev;
                  return rest;
                }
                return { ...prev, [subtopic]: updatedCards };
              });
            } catch (err) {
              setError("Failed to delete flashcard. Please try again.");
              console.error(err);
            }
          },
        },
      ]
    );
  };

  const handleDeleteCollection = (subtopic) => {
    Alert.alert(
      "Delete Collection",
      `Are you sure you want to delete the entire "${subtopic}" collection?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const savedFlashcards = await getSavedFlashcards();
              const updatedFlashcards = savedFlashcards.filter(card => card.subtopic !== subtopic);
              await AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(updatedFlashcards));
              setCollections(prev => {
                const { [subtopic]: _, ...rest } = prev;
                return rest;
              });
            } catch (err) {
              setError("Failed to delete collection. Please try again.");
              console.error(err);
            }
          },
        },
      ]
    );
  };

  const renderCollection = ({ item: [subtopic, cards] }) => {
    const isExpanded = expandedCollection === subtopic;
    const containerHeight = isExpanded 
      ? CARD_HEIGHT * cards.length + (cards.length - 1) * 8 
      : CARD_HEIGHT + (cards.length - 1) * STACK_OFFSET;

    return (
      <View style={styles.collectionContainer}>
        <View style={styles.collectionHeader}>
          <Text style={styles.collectionTitle}>{subtopic}</Text>
          <Text style={styles.cardCount}>{cards.length} cards</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => toggleCollection(subtopic)}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownButtonText}>Expand</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteCollectionButton}
              onPress={() => handleDeleteCollection(subtopic)}
              activeOpacity={0.8}
            >
              <Icon name="delete" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.stackContainer, { height: containerHeight }]}>
          {cards.map((card, index) => {
            const offset = isExpanded ? index * (CARD_HEIGHT + 8) : index * STACK_OFFSET;
            
            return (
              <Animated.View
                key={card.id}
                style={[
                  styles.stackedCard,
                  {
                    zIndex: cards.length - index,
                    transform: [{
                      translateY: animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [index * STACK_OFFSET, offset]
                      })
                    }]
                  }
                ]}
              >
                <TouchableOpacity
                  style={[styles.flashcardContainer, { backgroundColor: card.backgroundColor || COLORS.card }]}
                  onPress={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
                  activeOpacity={0.9}
                >
                  <Flashcard 
                    flashcard={card} 
                    expanded={expandedCard === card.id}
                  />
                  {expandedCard === card.id && (
                    <TouchableOpacity 
                      style={styles.deleteButton} 
                      onPress={() => handleDelete(card.id, subtopic)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderModalContent = () => (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Select a Collection to Test</Text>
      <FlatList
        data={Object.entries(collections)}
        keyExtractor={([subtopic]) => subtopic}
        renderItem={({ item: [subtopic, cards] }) => (
          <TouchableOpacity
            style={styles.modalItem}
            onPress={() => {
              setSelectedCollection(cards);
              setModalVisible(false);
              setTimerModalVisible(true);
            }}
          >
            <Text style={styles.modalItemText}>{subtopic}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.modalCloseButton}
        onPress={() => setModalVisible(false)}
      >
        <Text style={styles.modalCloseButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTimerModalContent = () => (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Set Timer</Text>
      <View style={styles.timerInputContainer}>
        <TextInput
          style={styles.timerInput}
          keyboardType="numeric"
          placeholder="Minutes"
          value={timerMinutes}
          onChangeText={setTimerMinutes}
        />
        <Text style={styles.timerSeparator}>:</Text>
        <TextInput
          style={styles.timerInput}
          keyboardType="numeric"
          placeholder="Seconds"
          value={timerSeconds}
          onChangeText={setTimerSeconds}
        />
      </View>
      <TouchableOpacity
        style={styles.modalCloseButton}
        onPress={() => {
          const totalSeconds = (parseInt(timerMinutes) || 0) * 60 + (parseInt(timerSeconds) || 0);
          setFlashcards(selectedCollection);
          setTimer(totalSeconds);
          setActiveTab('test');
          setTimerModalVisible(false);
        }}
      >
        <Text style={styles.modalCloseButtonText}>Start Test with Timer</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.modalCloseButton}
        onPress={() => {
          setFlashcards(selectedCollection);
          setTimer(0); // No timer
          setActiveTab('test');
          setTimerModalVisible(false);
        }}
      >
        <Text style={styles.modalCloseButtonText}>Start Test without Timer</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.modalCloseButton}
        onPress={() => setTimerModalVisible(false)}
      >
        <Text style={styles.modalCloseButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadFlashcards}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (Object.keys(collections).length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No flashcard collections yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={Object.entries(collections)}
        keyExtractor={([subtopic]) => subtopic}
        renderItem={renderCollection}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadFlashcards} />
        }
      />
      <TouchableOpacity 
        style={styles.testButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.testButtonText}>Test Flashcards</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {renderModalContent()}
        </View>
      </Modal>
      <Modal
        visible={timerModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setTimerModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {renderTimerModalContent()}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: 16,
  },
  collectionContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  collectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.primary,
    textTransform: 'capitalize',
  },
  cardCount: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.7,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownButton: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  dropdownButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  deleteCollectionButton: {
    backgroundColor: COLORS.error,
    padding: 8,
    borderRadius: 8,
  },
  deleteCollectionButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  testButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  testButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  stackContainer: {
    position: 'relative',
    width: screenWidth - 64,
  },
  stackedCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: CARD_HEIGHT,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  flashcardContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    marginHorizontal: 16,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  errorText: {
    color: COLORS.error,
    marginBottom: 20,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 16,
  },
  modalItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    width: '100%',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  modalCloseButton: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  timerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerInput: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    textAlign: 'center',
  },
  timerSeparator: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    marginHorizontal: 8,
  },
});