import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import GenerateScreen from "./screens/GenerateScreen";
import SavedScreen from "./screens/SavedScreen";
import TestScreen from "./screens/TestScreen";

const COLORS = {
  primary: "#6200ee",
  background: "#f8f8f8",
  card: "#ffffff",
  text: "#333333",
  border: "#e0e0e0",
};

export default function App() {
  const [activeTab, setActiveTab] = useState('generate');
  const [flashcards, setFlashcards] = useState([]);
  const [timer, setTimer] = useState(0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.content}>
        {activeTab === 'generate' && <GenerateScreen setActiveTab={setActiveTab} />}
        {activeTab === 'saved' && <SavedScreen setActiveTab={setActiveTab} setFlashcards={setFlashcards} setTimer={setTimer} />}
        {activeTab === 'test' && <TestScreen flashcards={flashcards} setActiveTab={setActiveTab} timer={timer} />}
      </View>

      {activeTab !== 'test' && (
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'generate' && styles.activeTab]} 
            onPress={() => setActiveTab('generate')}
          >
            <Text style={[styles.tabText, activeTab === 'generate' && styles.activeTabText]}>
              Generate
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'saved' && styles.activeTab]} 
            onPress={() => setActiveTab('saved')}
          >
            <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>
              Saved
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.text,
    fontSize: 14,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});