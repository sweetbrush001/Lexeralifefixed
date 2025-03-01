import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

/**
 * A reusable music player control component
 */
const MusicPlayer = ({
  track,
  isPlaying,
  onPlayPause,
  onStop,
  onVolumeChange,
  loading,
  volume,
  timerText,
  style
}) => {
  if (!track) return null;
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.trackInfo}>
        <Icon 
          name={track.icon || 'music'} 
          size={24} 
          color="#fff" 
        />
        <Text style={styles.trackName}>
          {track.name || 'Unknown Track'}
        </Text>
        {timerText && (
          <Text style={styles.timerText}>
            {timerText}
          </Text>
        )}
      </View>
      
      <View style={styles.controls}>
        {/* Volume button */}
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => onVolumeChange(volume > 0 ? 0 : 1)}
        >
          <Icon 
            name={volume > 0 ? "volume-up" : "volume-off"} 
            size={18} 
            color="#fff" 
          />
        </TouchableOpacity>
        
        {/* Play/Pause button */}
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={onPlayPause}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon 
              name={isPlaying ? "pause" : "play"} 
              size={18} 
              color="#fff" 
            />
          )}
        </TouchableOpacity>
        
        {/* Stop button */}
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={onStop}
          disabled={loading}
        >
          <Icon name="stop" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF9999',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trackName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 12,
  },
  timerText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginLeft: 10,
  },
  controls: {
    flexDirection: 'row',
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});

export default MusicPlayer;
