/**
 * Helper functions for working with Cloudinary resources
 */

// Cloud configuration - only use this on server-side code in production
export const cloudConfig = {
  cloudName: 'dxpanjyqp',
  apiKey: '993134287589191',
  // DO NOT include apiSecret in client-side code
};

// ID mappings for relaxation sounds
export const CLOUDINARY_AUDIO_IDS = {
  rain: 'vqqkab5yanpgupyi9m5d',     // rainfall
  forest: 'ionogcelyaksonrbucir',   // forest-ambience
  waves: 'dptus7zquwspyqnshxkc',    // ocean-waves  
  fire: 'e2ubw9huyiflemppa1q1',     // crackling-fire
  piano: 'jqejaemsv3830ct0rvlm',    // piano
};

/**
 * Generate a Cloudinary URL for an audio file stored as video type
 * @param {string} publicId - The public ID of the resource
 * @param {Object} options - Additional options
 * @returns {string} - The formatted URL
 */
export const getAudioUrl = (publicId, options = {}) => {
  const { cloudName = cloudConfig.cloudName, format = 'mp3' } = options;
  return `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}.${format}`;
};

/**
 * Generate URLs for all relaxation sounds
 * @returns {Object} - Object with track IDs as keys and URLs as values
 */
export const getAllRelaxationSoundUrls = () => {
  const urls = {};
  for (const [trackId, publicId] of Object.entries(CLOUDINARY_AUDIO_IDS)) {
    urls[trackId] = getAudioUrl(publicId);
  }
  return urls;
};
