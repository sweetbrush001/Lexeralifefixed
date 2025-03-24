import React, { useState, useEffect, useRef } from "react";
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
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Flashcard from "../components/Flashcard";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSavedFlashcards, removeFlashcard, clearFlashcards } from "../utils/storage";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: "#7C4DFF", // Purple primary color
  primaryLight: "#B39DDB",
  secondary: "#FF9800", // Orange accent
  background: "#F5F7FA",
  card: "#FFFFFF",
  text: "#333333",
  textLight: "#78909C",
  border: "#E0E0E0",
  success: "#4CAF50",
  error: "#F44336",
  shadow: "#000",
};

const CARD_HEIGHT = 220;
const STACK_OFFSET = 8;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);

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

  const toggleSearch = () => {
    setIsSearching(!isSearching);
    setSearchQuery('');
    if (!isSearching) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  const filteredCollections = () => {
    if (!searchQuery.trim()) return Object.entries(collections);
    
    const filtered = {};
    
    Object.entries(collections).forEach(([subtopic, cards]) => {
      const matchingCards = cards.filter(card => 
        card.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        card.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subtopic.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (matchingCards.length > 0) {
        filtered[subtopic] = matchingCards;
      }
    });
    
    return Object.entries(filtered);
  };

  const renderCollection = ({ item: [subtopic, cards] }) => {
    const isExpanded = expandedCollection === subtopic;
    const containerHeight = isExpanded 
      ? CARD_HEIGHT * cards.length + (cards.length - 1) * 12 
      : CARD_HEIGHT + (cards.length - 1) * STACK_OFFSET;

    // Get category color for the collection
    const getCategoryColor = () => {
      const categories = {
        "technology": "#7C4DFF",
        "geography": "#26A69A",
        "history": "#EF5350",
        "science": "#42A5F5",
        "other": "#FFA726"
      };
      
      // Use the category of the first card, or default
      const category = cards[0]?.category || "other";
      return categories[category] || COLORS.primary;
    };

    return (
      <View style={styles.collectionContainer}>
        <LinearGradient
          colors={[getCategoryColor() + '20', COLORS.card]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.collectionGradient}
        >
          <View style={styles.collectionHeader}>
            <View style={styles.collectionTitleContainer}>
              <Text style={styles.collectionTitle}>{subtopic}</Text>
              <View style={[styles.cardCountBadge, { backgroundColor: getCategoryColor() + '30' }]}>
                <Text style={[styles.cardCount, { color: getCategoryColor() }]}>{cards.length}</Text>
              </View>
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: getCategoryColor() }]}
                onPress={() => toggleCollection(subtopic)}
              >
                <Ionicons 
                  name={isExpanded ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#fff" 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: COLORS.error }]}
                onPress={() => handleDeleteCollection(subtopic)}
              >
                <Ionicons name="trash-outline" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.stackContainer, { height: containerHeight }]}>
            {cards.map((card, index) => {
              const offset = isExpanded ? index * (CARD_HEIGHT + 12) : index * STACK_OFFSET;
              
              return (
                <Animated.View
                  key={card.id || index}
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
                  <View style={styles.flashcardContainer}>
                    <Flashcard 
                      flashcard={card} 
                      expanded={expandedCard === card.id}
                    />
                    {isExpanded && (
                      <TouchableOpacity 
                        style={styles.deleteButton} 
                        onPress={() => handleDelete(card.id, subtopic)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#fff" />
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Animated.View>
              );
            })}
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderModalContent = () => (
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Select a Collection</Text>
        <TouchableOpacity
          style={styles.modalCloseIcon}
          onPress={() => setModalVisible(false)}
        >
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      
      {Object.keys(collections).length === 0 ? (
        <View style={styles.emptyModalContainer}>
          <Ionicons name="folder-open-outline" size={64} color={COLORS.primaryLight} />
          <Text style={styles.emptyModalText}>No collections available</Text>
        </View>
      ) : (
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
              <View style={styles.modalItemContent}>
                <Text style={styles.modalItemText}>{subtopic}</Text>
                <Text style={styles.modalItemCount}>{cards.length} cards</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.modalList}
        />
      )}
    </View>
  );

  const renderTimerModalContent = () => (
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Set Timer</Text>
        <TouchableOpacity
          style={styles.modalCloseIcon}
          onPress={() => setTimerModalVisible(false)}
        >
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.timerInputContainer}>
        <View style={styles.timerInputWrapper}>
          <TextInput
            style={styles.timerInput}
            keyboardType="numeric"
            placeholder="00"
            value={timerMinutes}
            onChangeText={setTimerMinutes}
            maxLength={2}
          />
          <Text style={styles.timerLabel}>Minutes</Text>
        </View>
        
        <Text style={styles.timerSeparator}>:</Text>
        
        <View style={styles.timerInputWrapper}>
          <TextInput
            style={styles.timerInput}
            keyboardType="numeric"
            placeholder="00"
            value={timerSeconds}
            onChangeText={setTimerSeconds}
            maxLength={2}
          />
          <Text style={styles.timerLabel}>Seconds</Text>
        </View>
      </View>
      
      <View style={styles.timerPresets}>
        <Text style={styles.timerPresetsTitle}>Quick Presets</Text>
        <View style={styles.timerPresetsRow}>
          {[1, 2, 5, 10].map(mins => (
            <TouchableOpacity 
              key={mins} 
              style={styles.timerPresetButton}
              onPress={() => {
                setTimerMinutes(mins.toString());
                setTimerSeconds('0');
              }}
            >
              <Text style={styles.timerPresetText}>{mins} min</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.modalButtonGroup}>
        <TouchableOpacity
          style={[styles.modalButton, styles.modalPrimaryButton]}
          onPress={() => {
            const totalSeconds = (parseInt(timerMinutes) || 0) * 60 + (parseInt(timerSeconds) || 0);
            setFlashcards(selectedCollection);
            setTimer(totalSeconds);
            setActiveTab('test');
            setTimerModalVisible(false);
          }}
        >
          <Ionicons name="timer-outline" size={20} color="#fff" />
          <Text style={styles.modalButtonText}>Start with Timer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.modalButton, styles.modalSecondaryButton]}
          onPress={() => {
            setFlashcards(selectedCollection);
            setTimer(0); // No timer
            setActiveTab('test');
            setTimerModalVisible(false);
          }}
        >
          <Ionicons name="play-outline" size={20} color="#fff" />
          <Text style={styles.modalButtonText}>Start without Timer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>My Collections</Text>
        
        {isSearching ? (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.textLight} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search collections..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={toggleSearch}>
              <Ionicons name="close" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={toggleSearch}
          >
            <Ionicons name="search" size={22} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
      
      {!isSearching && (
        <Text style={styles.headerSubtitle}>
          {Object.keys(collections).length} {Object.keys(collections).length === 1 ? 'collection' : 'collections'} • {
            Object.values(collections).reduce((total, cards) => total + cards.length, 0)
          } flashcards
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading collections...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadFlashcards}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filtered = filteredCollections();
  const isEmpty = filtered.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        {renderHeader()}
        
        {isEmpty ? (
          <View style={styles.emptyContainer}>
            {searchQuery ? (
              <>
                <Ionicons name="search" size={64} color={COLORS.primaryLight} />
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptyText}>
                  No flashcards match your search "{searchQuery}"
                </Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => setSearchQuery('')}
                >
                  <Text style={styles.emptyButtonText}>Clear Search</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Image 
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4076/4076478.png' }}
                  style={styles.emptyImage}
                />
                <Text style={styles.emptyTitle}>No flashcards yet</Text>
                <Text style={styles.emptyText}>
                  Create your first flashcard collection to get started
                </Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => setActiveTab('generate')}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#fff" />
                  <Text style={styles.emptyButtonText}>Create Flashcards</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={([subtopic]) => subtopic}
            renderItem={renderCollection}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={loadFlashcards}
                colors={[COLORS.primary]} 
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
        
        {!isEmpty && (
          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="school-outline" size={20} color="#fff" />
            <Text style={styles.testButtonText}>Test Flashcards</Text>
          </TouchableOpacity>
        )}
        
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalOverlay} />
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
            <View style={styles.modalOverlay} />
            {renderTimerModalContent()}
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: COLORS.background,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  searchButton: {
    padding: 8,
    borderRadius: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginLeft: 12,
    height: 44,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 44,
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.text,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textLight,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding for the test button
  },
  collectionContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  collectionGradient: {
    borderRadius: 16,
    padding: 16,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  collectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    textTransform: 'capitalize',
    marginRight: 8,
  },
  cardCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardCount: {
    fontSize: 14,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  stackContainer: {
    position: 'relative',
    width: '100%',
  },
  stackedCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: CARD_HEIGHT,
  },
  flashcardContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    alignSelf: 'flex-end',
    width: 100,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  errorText: {
    color: COLORS.error,
    marginTop: 16,
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  testButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  testButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },
  modalCloseIcon: {
    padding: 4,
  },
  modalList: {
    paddingVertical: 8,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalItemContent: {
    flex: 1,
  },
  modalItemText: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalItemCount: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  emptyModalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyModalText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 16,
  },
  timerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  timerInputWrapper: {
    alignItems: 'center',
  },
  timerInput: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    borderRadius: 12,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.primary,
  },
  timerLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
  },
  timerSeparator: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
    marginHorizontal: 16,
  },
  timerPresets: {
    marginBottom: 24,
  },
  timerPresetsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  timerPresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timerPresetButton: {
    backgroundColor: COLORS.primaryLight + '30',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    width: '23%',
    alignItems: 'center',
  },
  timerPresetText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalButtonGroup: {
    marginTop: 8,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  modalPrimaryButton: {
    backgroundColor: COLORS.primary,
  },
  modalSecondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});