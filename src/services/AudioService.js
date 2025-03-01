import { Audio } from 'expo-av';

/**
 * Audio Service - Handles all audio playback operations
 */
class AudioService {
  constructor() {
    this.sound = null;
    this.isPlaying = false;
    this.currentTrackId = null;
    this.volume = 1.0;
    this.onPlaybackStatusUpdate = null;
    this.initialized = false;
  }

  /**
   * Initialize audio session
   */
  async init() {
    if (this.initialized) return;
    
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: 1,
        shouldDuckAndroid: true,
        interruptionModeAndroid: 1,
        playThroughEarpieceAndroid: false,
      });
      this.initialized = true;
      console.log("Audio initialized successfully");
    } catch (error) {
      console.error('Failed to initialize audio', error);
      throw error;
    }
  }

  /**
   * Load and play a track - FIXED METHOD
   * @param {string} uri - Track URI
   * @param {string} trackId - Track identifier
   * @param {Function} statusCallback - Callback for status updates
   */
  async loadAndPlay(uri, trackId, statusCallback = null) {
    await this.init();
    
    // Unload any existing sound first
    await this.unloadSound();
    
    try {
      console.log(`Loading track: ${trackId} from URI: ${uri}`);
      
      // Use the static createAsync method instead of instantiating and then loading
      const { sound: soundObject } = await Audio.Sound.createAsync(
        { uri },
        { 
          shouldPlay: true,  // This will auto-play once loaded
          isLooping: true,
          volume: this.volume,
          progressUpdateIntervalMillis: 1000,
        },
        (status) => {
          // This is the status update callback
          if (status.error) {
            console.error(`Playback error: ${status.error}`);
          }
          if (statusCallback) {
            statusCallback(status);
          }
        }
      );
      
      console.log(`Track loaded and playing: ${trackId}`);
      
      // Store the sound object
      this.sound = soundObject;
      this.isPlaying = true;
      this.currentTrackId = trackId;
      
      return true;
    } catch (error) {
      console.error(`Error loading and playing sound: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Play or pause the current track
   */
  async togglePlayPause() {
    if (!this.sound) {
      console.warn('No sound loaded to toggle');
      return false;
    }
    
    try {
      // Safely check status
      let status;
      try {
        status = await this.sound.getStatusAsync();
      } catch (err) {
        console.error('Error getting sound status:', err);
        this.reset(); // Reset if we can't even get status
        return false;
      }
      
      if (!status.isLoaded) {
        console.warn('Sound is not loaded');
        this.reset();
        return false;
      }
      
      if (status.isPlaying) {
        // If playing, pause it
        console.log('Attempting to pause...');
        await this.sound.pauseAsync();
        this.isPlaying = false;
        console.log('Sound paused successfully');
      } else {
        // If paused, play it
        console.log('Attempting to play...');
        await this.sound.playAsync();
        this.isPlaying = true;
        console.log('Sound playing successfully');
      }
      return true;
    } catch (error) {
      console.error('Error in togglePlayPause:', error);
      
      // Reset state if we encounter an error
      this.reset();
      return false;
    }
  }

  /**
   * Reset the player state without trying to access the sound object
   * This is a safe way to clear state when the sound object is in a bad state
   */
  reset() {
    console.log('Resetting audio player state');
    this.sound = null;
    this.isPlaying = false;
    this.currentTrackId = null;
  }

  /**
   * Stop and unload the current sound
   */
  async unloadSound() {
    // If no sound, nothing to do
    if (!this.sound) {
      return;
    }
    
    console.log('Attempting to unload sound...');
    
    try {
      // Safely check if the sound is loaded
      let isLoaded = false;
      try {
        const status = await this.sound.getStatusAsync();
        isLoaded = status.isLoaded;
      } catch (err) {
        console.warn('Could not get sound status:', err.message);
      }
      
      if (isLoaded) {
        // Try to stop first if it's playing
        try {
          await this.sound.stopAsync();
          console.log('Sound stopped');
        } catch (stopError) {
          console.warn('Could not stop sound:', stopError.message);
          // Continue to try unloading even if stopping fails
        }
        
        // Then try to unload
        try {
          await this.sound.unloadAsync();
          console.log('Sound unloaded');
        } catch (unloadError) {
          console.warn('Could not unload sound:', unloadError.message);
        }
      }
    } catch (error) {
      console.warn('Error in unloadSound:', error.message);
    } finally {
      // Always reset the state regardless of errors
      this.reset();
    }
  }

  /**
   * Set volume level
   * @param {number} value - Volume level between 0 and 1
   */
  async setVolume(value) {
    this.volume = value;
    
    if (!this.sound) return;
    
    try {
      // Safely check if sound is loaded first
      const status = await this.sound.getStatusAsync().catch(() => ({ isLoaded: false }));
      
      if (status.isLoaded) {
        await this.sound.setVolumeAsync(value);
        console.log(`Volume set to ${value}`);
      }
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }
  
  /**
   * Create a playback status callback function
   */
  _onPlaybackStatusUpdate(externalCallback) {
    return (status) => {
      // Only process significant status updates to reduce console noise
      if (status.error) {
        console.error('Audio playback error:', status.error);
      } else if (status.didJustFinish) {
        console.log('Track playback finished');
      }
      
      // Call external callback if provided
      if (externalCallback && typeof externalCallback === 'function') {
        externalCallback(status);
      }
    };
  }
}

// Create a singleton instance
export default new AudioService();
