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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Flashcard from "../components/Flashcard";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSavedFlashcards, removeFlashcard } from "../utils/storage";

const { width } = Dimensions.get('window');

// Clean, minimalist color palette
const COLORS = {
  primary: "#7C4DFF",
  primaryLight: "#EDE7F6",
  background: "#FFFFFF",
  card: "#F9F9F9",
  text: "#333333",
  textLight: "#757575",
  border: "#EEEEEE",
  success: "#66BB6A",
  error: "#EF5350",
  shadow: "#000",
};

const CARD_HEIGHT = 200;
const FLASHCARDS_KEY = 'flashcards';

export default function SavedScreen({ setActiveTab, setFlashcards, setTimer }) {
  const [collections, setCollections] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [expandedCollection, setExpandedCollection] = useState(null);
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

    return (
      <View style={styles.collectionContainer}>
        <TouchableOpacity 
          style={styles.collectionHeader}
          onPress={() => setExpandedCollection(isExpanded ? null : subtopic)}
          activeOpacity={0.7}
        >
          <View style={styles.collectionTitleContainer}>
            <Text style={styles.collectionTitle}>{subtopic}</Text>
            <View style={styles.cardCountContainer}>
              <Text style={styles.cardCount}>{cards.length} cards</Text>
            </View>
          </View>
          
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => handleDeleteCollection(subtopic)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.textLight} />
            </TouchableOpacity>
            
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={COLORS.textLight} 
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.flashcardsContainer}>
            {cards.map((card, index) => (
              <View key={card.id || index} style={styles.flashcardWrapper}>
                <Flashcard flashcard={card} />
                <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={() => handleDelete(card.id, subtopic)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderModalContent = () => (
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Select a Collection</Text>
        <TouchableOpacity
          style={styles.modalCloseButton}
          onPress={() => setModalVisible(false)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      
      {Object.keys(collections).length === 0 ? (
        <View style={styles.emptyModalContainer}>
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
              <Text style={styles.modalItemText}>{subtopic}</Text>
              <View style={styles.modalItemRight}>
                <Text style={styles.modalItemCount}>{cards.length} cards</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
              </View>
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
          style={styles.modalCloseButton}
          onPress={() => setTimerModalVisible(false)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
          style={[styles.modalActionButton, styles.primaryButton]}
          onPress={() => {
            const totalSeconds = (parseInt(timerMinutes) || 0) * 60 + (parseInt(timerSeconds) || 0);
            setFlashcards(selectedCollection);
            setTimer(totalSeconds);
            setActiveTab('test');
            setTimerModalVisible(false);
          }}
        >
          <Text style={styles.buttonText}>Start with Timer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.modalActionButton, styles.secondaryButton]}
          onPress={() => {
            setFlashcards(selectedCollection);
            setTimer(0); // No timer
            setActiveTab('test');
            setTimerModalVisible(false);
          }}
        >
          <Text style={styles.buttonText}>Start without Timer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>My Collections</Text>
        
        {isSearching ? (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={COLORS.textLight} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search collections..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={toggleSearch}>
              <Ionicons name="close" size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={toggleSearch}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="search" size={20} color={COLORS.textLight} />
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
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadFlashcards}>
          <Text style={styles.buttonText}>Retry</Text>
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
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptyText}>
                  No flashcards match your search "{searchQuery}"
                </Text>
                <TouchableOpacity 
                  style={[styles.emptyButton, styles.primaryButton]}
                  onPress={() => setSearchQuery('')}
                >
                  <Text style={styles.buttonText}>Clear Search</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.emptyTitle}>No flashcards yet</Text>
                <Text style={styles.emptyText}>
                  Create your first flashcard collection to get started
                </Text>
                <TouchableOpacity 
                  style={[styles.emptyButton, styles.primaryButton]}
                  onPress={() => setActiveTab('generate')}
                >
                  <Text style={styles.buttonText}>Create Flashcards</Text>
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
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.testButton, styles.primaryButton]}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.buttonText}>Test Flashcards</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <Modal
          visible={modalVisible}
          animationType="fade"
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
          animationType="fade"
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
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  iconButton: {
    padding: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginLeft: 12,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    height: 40,
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
    paddingBottom: 80, // Extra padding for the test button
  },
  collectionContainer: {
    marginBottom: 16,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  collectionTitleContainer: {
    flex: 1,
  },
  collectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  cardCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardCount: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flashcardsContainer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  flashcardWrapper: {
    marginBottom: 16,
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  testButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.textLight,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: COLORS.error,
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
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
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
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalList: {
    paddingVertical: 8,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  modalItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalItemCount: {
    fontSize: 14,
    color: COLORS.textLight,
    marginRight: 8,
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
  },
  timerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  timerInputWrapper: {
    alignItems: 'center',
  },
  timerInput: {
    width: 70,
    height: 70,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    color: COLORS.text,
  },
  timerLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
  },
  timerSeparator: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.text,
    marginHorizontal: 16,
  },
  timerPresets: {
    marginBottom: 20,
  },
  timerPresetsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  timerPresetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timerPresetButton: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '22%',
  },
  timerPresetText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalButtonGroup: {
    marginTop: 8,
  },
  modalActionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
});