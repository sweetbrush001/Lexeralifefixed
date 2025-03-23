import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIntroSlider from 'react-native-app-intro-slider';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { markFeatureIntroAsSeen } from '../utils/FeatureIntroUtils';
// Update import path for IntroImage if needed
import IntroImage from './IntroImage';

const { width, height } = Dimensions.get('window');
