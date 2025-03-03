import React, { useState, useRef, useEffect } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Easing,
  Platform,
  Modal,
  View,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import * as Speech from 'expo-speech';
import { useTextReader } from '../context/TextReaderContext';

const DraggableVoiceButton = ({ onSpeechResult }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  const fabAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pan = useRef(new Animated.ValueXY()).current;
  const inputRef = useRef(null);
  
  // Get text reader context for TTS
  const { getAllReadableText } = useTextReader();
  
  // Screen dimensions
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  // Initial position
  useEffect(() => {
    pan.setValue({
      x: screenWidth - 80,
      y: screenHeight - 150
    });
  }, [screenWidth, screenHeight]);
  
  // Pan responder setup
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
        pan.setValue({ x: 0, y: 0 });
        
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: false,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: false,
          })
        ]).start();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        
        let newX = Math.max(0, Math.min(pan.x._value, screenWidth - 70));
        let newY = Math.max(100, Math.min(pan.y._value, screenHeight - 100));
        
        Animated.spring(pan, {
          toValue: { x: newX, y: newY },
          useNativeDriver: false,
          friction: 5
        }).start();
      }
    })
  ).current;
  
  // Stop active functions
  const stopActiveFunction = async () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      setStatus('Stopped reading');
      setTimeout(() => setStatus(''), 1000);
      return true;
    }
    
    return false;
  };
  
  // Button press handler
  const handleButtonPress = async () => {
    const stopped = await stopActiveFunction();
    if (!stopped) {
      toggleFAB();
    }
  };
  
  // Toggle FAB
  const toggleFAB = () => {
    if (isSpeaking) return;
    
    if (isExpanded) {
      Animated.timing(fabAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.out(Easing.back(1.5)),
      }).start();
    } else {
      Animated.timing(fabAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
        easing: Easing.elastic(1.2),
      }).start();
    }
    setIsExpanded(!isExpanded);
  };

  // TTS function
  const activateTTS = async () => {
    if (isSpeaking) {
      await stopActiveFunction();
      return;
    }
    
    const textToRead = getAllReadableText();
    
    if (!textToRead || textToRead.trim() === '') {
      setStatus('No text to read');
      setTimeout(() => setStatus(''), 2000);
      return;
    }
    
    setStatus('Reading text...');
    setIsSpeaking(true);
    
    Speech.speak(textToRead, {
      language: 'en',
      pitch: 1.0,
      rate: 0.7,
      onDone: () => {
        setIsSpeaking(false);
        setStatus('');
      },
      onStopped: () => {
        setIsSpeaking(false);
        setStatus('');
      },
      onError: (error) => {
        console.error('TTS error:', error);
        setIsSpeaking(false);
        setStatus('Error reading text');
        setTimeout(() => setStatus(''), 2000);
      }
    });
    
    toggleFAB();
  };

  // Empty STT function that just shows the text input modal
  const activateSTT = () => {
    showTextInputModal();
  };
  
  // Show text input modal as fallback
  const showTextInputModal = () => {
    setModalVisible(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 300);
  };
  
  // Handle text submission from modal
  const handleTextSubmit = () => {
    if (inputText.trim() && onSpeechResult) {
      try {
        onSpeechResult(inputText.trim());
        setInputText('');
        setModalVisible(false);
        setStatus('Message sent!');
        setTimeout(() => setStatus(''), 2000);
      } catch (error) {
        console.error('Error submitting text:', error);
        setStatus('Error sending message');
        setTimeout(() => setStatus(''), 2000);
      }
    }
  };

  // Animated values
  const ttsTranslateY = fabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -90]
  });
  
  const sttTranslateY = fabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -170]
  });
  
  const rotation = fabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });

  const opacity = fabAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1]
  });

  return (
    <>
      <Animated.View
        style={[styles.container, { 
          transform: [
            { translateX: pan.x }, 
            { translateY: pan.y }, 
            { scale: scaleAnim }
          ] 
        }]}
        {...panResponder.panHandlers}
      >
        {/* TTS Option */}
        <Animated.View
          style={[
            styles.option, 
            styles.ttsOption, 
            { 
              opacity, 
              transform: [{ translateY: ttsTranslateY }], 
              zIndex: isExpanded ? 1 : -1 
            }
          ]}
        >
          <TouchableOpacity
            style={[styles.optionButton, isSpeaking ? styles.activeOption : null]}
            onPress={activateTTS}
            activeOpacity={0.8}
          >
            <Icon name="volume-up" size={22} color="#fff" />
            <Text style={styles.optionText}>
              {isSpeaking ? "Stop Reading" : "Read Text"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Text Input Option */}
        <Animated.View
          style={[
            styles.option, 
            styles.sttOption, 
            { 
              opacity, 
              transform: [{ translateY: sttTranslateY }], 
              zIndex: isExpanded ? 1 : -1 
            }
          ]}
        >
          <TouchableOpacity
            style={styles.optionButton}
            onPress={activateSTT}
            activeOpacity={0.8}
          >
            <Icon name="keyboard" size={22} color="#fff" />
            <Text style={styles.optionText}>
              Message Input
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Status Text */}
        {status ? (
          <Animated.View
            style={[styles.statusBubble, { 
              opacity: status ? 1 : 0, 
              transform: [{ translateY: -220 }]
            }]}
          >
            <Text style={styles.statusText}>{status}</Text>
          </Animated.View>
        ) : null}

        {/* Main Button */}
        <TouchableOpacity
          style={[
            styles.fab, 
            isExpanded ? styles.fabActive : null, 
            isSpeaking ? styles.fabSpeaking : null
          ]}
          onPress={handleButtonPress}
          activeOpacity={0.9}
        >
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Icon 
              name={isSpeaking ? "volume-up" : "plus"} 
              size={24} 
              color="#fff" 
            />
          </Animated.View>
          {isSpeaking && (
            <Text style={styles.speakingIndicator}>•</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
      
      {/* Text Input Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View 
              style={styles.modalContent} 
              onStartShouldSetResponder={() => true}
              onResponderRelease={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Type Your Message</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Icon name="times" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                multiline
                placeholder="Enter your message here..."
                value={inputText}
                onChangeText={setInputText}
                autoFocus
              />
              
              <TouchableOpacity
                style={[styles.submitButton, !inputText.trim() && styles.submitButtonDisabled]}
                onPress={handleTextSubmit}
                disabled={!inputText.trim()}
              >
                <Text style={styles.submitButtonText}>Send Message</Text>
                <Icon name="paper-plane" size={16} color={inputText.trim() ? "#fff" : "#aaa"} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  fab: {
    backgroundColor: '#A990FF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 999,
    borderWidth: 2,
    borderColor: '#fff',
  },
  fabActive: {
    backgroundColor: '#9470FF',
  },
  fabSpeaking: {
    backgroundColor: '#44AAFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    maxHeight: 150,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#A990FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 15,
    borderRadius: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  speakingIndicator: {
    position: 'absolute',
    bottom: 5,
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  option: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A990FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    borderWidth: 1,
    borderColor: '#fff',
    minWidth: 140,
    justifyContent: 'center',
  },
  activeOption: {
    backgroundColor: '#44AAFF',
  },
  ttsOption: {
    zIndex: 2,
  },
  sttOption: {
    zIndex: 3,
  },
  optionText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  statusBubble: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    zIndex: 1000,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
  }
});

export default DraggableVoiceButton;