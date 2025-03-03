import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthNavigator from "./AuthNavigator";
import HomeScreen from "../screens/home/HomeScreen";
import GameScreen from "../screens/features/GameScreen";
import ChatbotScreen from "../screens/features/ChatbotScreen";
import TestScreen from "../screens/features/testScreen/TestScreen";
import ResultsScreen from "../screens/features/testScreen/ResultsScreen";
import PreviousResultsScreen from "../screens/features/testScreen/PreviousResultsScreen";
import TestIntroScreen from "../screens/features/testScreen/TestIntroScreen";
import SettingsScreen from "../screens/sidepanel/SettingsScreen";
import { SettingsProvider } from '../context/SettingsContext';
import CommunityPage from "../screens/features/community/CommunityPage";
import CreatePost from "../screens/features/community/CreatePost";
import ProfileSettingsScreen from "../screens/sidepanel/ProfileSettingsScreen";
import FeedbackScreen from '../screens/feedback/FeedbackScreen';
import RelaxScreen from "../screens/relax/RelaxScreen";
import AgeRangeSelector from "../screens/auth/AgeRangeSelector"; 
import LoadingScreen from "../screens/loading/LoadingScreen";
import FeatureRedirector from '../components/FeatureRedirector';

// Import Intro Screens
import ChatbotIntroScreen from '../screens/intros/ChatbotIntroScreen';
import RelaxIntroScreen from '../screens/intros/RelaxIntroScreen';
import TestIntroIntroScreen from '../screens/intros/TestIntroScreen';
import GameIntroScreen from '../screens/intros/GameIntroScreen';
import CommunityIntroScreen from '../screens/intros/CommunityIntroScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <SettingsProvider>
      <Stack.Navigator initialRouteName="Loading" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Chatbot" component={ChatbotScreen} />
        
        {/* Test related screens */}
        <Stack.Screen name="TestIntro" component={TestIntroScreen} />
        <Stack.Screen name="Test" component={TestScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen name="PreviousResults" component={PreviousResultsScreen} />
        
        <Stack.Screen name="settings" component={SettingsScreen} />
        <Stack.Screen name="Community" component={CommunityPage} />
        <Stack.Screen name="CreatePost" component={CreatePost} />
        <Stack.Screen name="profile" component={ProfileSettingsScreen} />
        <Stack.Screen name="Feedback" component={FeedbackScreen} />
        <Stack.Screen name="Relax" component={RelaxScreen} />
        <Stack.Screen name="AgeRangeSelector" component={AgeRangeSelector} />
        
        {/* Intro Screens */}
        <Stack.Screen name="ChatbotIntro" component={ChatbotIntroScreen} />
        <Stack.Screen name="RelaxIntro" component={RelaxIntroScreen} />
        <Stack.Screen name="TestIntroIntro" component={TestIntroIntroScreen} />
        <Stack.Screen name="GameIntro" component={GameIntroScreen} />
        <Stack.Screen name="CommunityIntro" component={CommunityIntroScreen} />
        
        {/* Use our dedicated FeatureRedirector component */}
        <Stack.Screen name="FeatureRedirector" component={FeatureRedirector} />
      </Stack.Navigator>
    </SettingsProvider>
  );
};

export default AppNavigator;
