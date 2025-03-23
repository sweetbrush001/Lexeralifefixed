import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar, View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import App from './App';
import { Ionicons } from '@expo/vector-icons';

const FlashCardsScreen = () => {
  const navigation = useNavigation();
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#6200ee" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flash Cards</Text>
        <View style={styles.placeholder} />
      </View>
      
      <App />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
});

export default FlashCardsScreen;
