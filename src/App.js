import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TextReaderProvider } from './context/TextReaderContext';
import AppNavigator from './navigation/AppNavigator';

// Remove any imports related to intro screens or initIntroSystem

export default function App() {
  // Remove any useEffect or other initialization related to intro screens
  
  return (
    <TextReaderProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </TextReaderProvider>
  );
}
