import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthNavigator from "./AuthNavigator";
import HomeScreen from "../screens/home/HomeScreen";
import ChatbotScreen from "../screens/features/ChatbotScreen";
import TestScreen from "../screens/features/testScreen/TestScreen";
import ResultsScreen from "../screens/features/testScreen/ResultsScreen";
import PreviousResultsScreen from "../screens/features/testScreen/PreviousResultsScreen";
import Teststart from "../screens/features/testScreen/TestIntroScreen";
import SettingsScreen from "../screens/sidepanel/SettingsScreen";
import { SettingsProvider } from '../context/SettingsContext';// Import AppProvider
import CommunityPage from "../screens/features/community/CommunityPage";
import CreatePost from "../screens/features/community/CreatePost";
import ProfileSettingsScreen from "../screens/sidepanel/ProfileSettingsScreen";
import FeedbackScreen from '../screens/feedback/FeedbackScreen';
import RelaxScreen from "../screens/relax/RelaxScreen";
import AgeRangeSelector from "../screens/auth/AgeRangeSelector"; 
import LoadingScreen from "../screens/loading/LoadingScreen";
import GuideScreen from "../screens/GuideScreen";
import HelpSupportScreen from '../screens/help/HelpSupportScreen';
import ReadAssistScreen from "../screens/TextToSpeechScreen";
import TypeTextScreen from "../screens/TypeTextScreen";
import WordBuilderGame from "../screens/games/WordBuilderGame";
import LetterRecognitionGame from "../screens/games/LetterRecognitionGame";
import MemoryMatchGame from "../screens/games/MemoryMatchGame";
import SpellingChallengeGame from "../screens/games/SpellingChallengeGame";
import PatternMatchGame from "../screens/games/PatternMatchGame";
import WordFlowGame from "../screens/games/WordFlowGame";
import PhonicsGame from "../screens/games/PhonicsGame";
import SpellingGame from "../screens/games/SpellingGame"; // Renamed to be more specific
import GamesScreen from "../screens/features/GamesScreen";
import WordScrambleGame from "../screens/games/WordScramble/WordScrambleGame";
import WordScrambleEntry from "../screens/games/WordScramble/WordScrambleEntry";
import Scoreboard from "../screens/games/WordScramble/Scoreboard";
import DSpellingGame from "../screens/games/Spellings/DSpellingApp"; // Import Ocean Spelling Game
import FlashCardsScreen from "../screens/features/Flashcards/FlashCardsScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
        <SettingsProvider>
            <Stack.Navigator initialRouteName="Loading" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Loading" component={LoadingScreen} />
              <Stack.Screen name="Auth" component={AuthNavigator} />
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Chatbot" component={ChatbotScreen} />
              <Stack.Screen name="Teststarting" component={Teststart} />
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
              <Stack.Screen name="Guide" component={GuideScreen} />
              <Stack.Screen name="help" component={HelpSupportScreen} />
              <Stack.Screen name="ReadAssist" component={ReadAssistScreen} />
              <Stack.Screen name="TypeTextScreen" component={TypeTextScreen} />
              <Stack.Screen name="Games" component={GamesScreen} />
              <Stack.Screen name="WordBuilderGame" component={WordBuilderGame} />
              <Stack.Screen name="LetterRecognitionGame" component={LetterRecognitionGame} />
              <Stack.Screen name="MemoryMatchGame" component={MemoryMatchGame} />
              <Stack.Screen name="SpellingChallengeGame" component={SpellingChallengeGame} />
              <Stack.Screen name="PatternMatchGame" component={PatternMatchGame} />
              <Stack.Screen name="WordFlowGame" component={WordFlowGame} />
              <Stack.Screen name="PhonicsGame" component={PhonicsGame} />
              <Stack.Screen name="SpellingGame" component={SpellingGame} /> 
              <Stack.Screen name="WordScrambleGame" component={WordScrambleGame} />
              <Stack.Screen name="WordScrambleEntry" component={WordScrambleEntry} />
              <Stack.Screen name="Scoreboard" component={Scoreboard} />
              <Stack.Screen name="FlashCards" component={FlashCardsScreen} />
              <Stack.Screen name="OceanSpellingGame" component={DSpellingGame} />
            </Stack.Navigator>
        </SettingsProvider> 
  );
};

export default AppNavigator;
