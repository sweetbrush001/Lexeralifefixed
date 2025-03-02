import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TextReaderProvider } from './context/TextReaderContext';
import AppNavigator from './navigation/AppNavigator'; // Your navigation setup

// Wrap the entire app with TextReaderProvider for global accessibility
export default function App() {
  return (
    <TextReaderProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </TextReaderProvider>
  );
}
