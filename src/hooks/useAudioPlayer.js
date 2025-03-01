import { useState, useEffect } from 'react';
import AudioService from '../services/AudioService';

/**
 * Custom hook for audio player functionality
 */
export default function useAudioPlayer() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playbackStatus, setPlaybackStatus] = useState(null);
  
  useEffect(() => {
    // Initialize the audio service
    AudioService.init().catch(err => {
      console.error('Failed to initialize audio service', err);
      setError('Failed to initialize audio player');
    });
    
    // Cleanup on unmount
    return () => {
      AudioService.unloadSound();
    };
  }, []);
  
  /**
   * Play a track with the given URI - IMPROVED VERSION
   * @param {string} uri - The track URI
   * @param {string} trackId - Identifier for the track
   * @param {object} metadata - Additional track information
   */
  const playTrack = async (uri, trackId, metadata = {}) => {
    if (!uri || !trackId) {
      setError('Invalid track information');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Attempting to play track: ${trackId}`);
      
      // Check if this is the same track
      if (currentTrack && currentTrack.id === trackId) {
        console.log('Same track - toggling play/pause');
        const success = await AudioService.togglePlayPause();
        
        if (success) {
          setIsPlaying(!isPlaying);
        } else {
          console.log('Toggle failed, will try to reload track');
          // If toggle failed, force reload
          await AudioService.loadAndPlay(uri, trackId, updatePlaybackStatus);
          setIsPlaying(true);
        }
      } else {
        console.log('New track - loading and playing');
        // Load and play new track
        await AudioService.loadAndPlay(uri, trackId, updatePlaybackStatus);
        setCurrentTrack({ id: trackId, uri, ...metadata });
        setIsPlaying(true);
      }
      
      console.log('Track play operation completed successfully');
    } catch (err) {
      console.error(`Error playing track: ${err.message}`, err);
      setError(`Couldn't play ${metadata.name || 'track'}: ${err.message || 'Unknown error'}`);
      // Reset state
      setCurrentTrack(null);
      setIsPlaying(false);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to update playback status
  const updatePlaybackStatus = (status) => {
    setPlaybackStatus(status);
    
    // Update isPlaying based on status
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
    }
  };
  
  /**
   * Stop the current track
   */
  const stopTrack = async () => {
    try {
      await AudioService.unloadSound();
      setCurrentTrack(null);
      setIsPlaying(false);
      setPlaybackStatus(null);
    } catch (err) {
      console.error('Error stopping track:', err);
      // Reset state even if there was an error
      setCurrentTrack(null);
      setIsPlaying(false);
    }
  };
  
  /**
   * Toggle play/pause of current track
   */
  const togglePlayPause = async () => {
    try {
      if (!currentTrack) return;
      
      const success = await AudioService.togglePlayPause();
      if (success) {
        setIsPlaying(!isPlaying);
      }
    } catch (err) {
      console.error('Error toggling play/pause', err);
    }
  };
  
  /**
   * Set the volume level
   * @param {number} value - Volume level between 0 and 1
   */
  const setVolume = async (value) => {
    try {
      await AudioService.setVolume(value);
      setVolumeState(value);
    } catch (err) {
      console.error('Error setting volume', err);
    }
  };
  
  return {
    currentTrack,
    isPlaying,
    volume,
    loading,
    error,
    playbackStatus,
    playTrack,
    stopTrack,
    togglePlayPause,
    setVolume,
    clearError: () => setError(null),
  };
}
