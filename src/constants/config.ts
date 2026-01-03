// API Configuration
export const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api/v1'
  : 'https://api.betakah.qa/api/v1';

export const SOCKET_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://api.betakah.qa';

// App Configuration
export const APP_CONFIG = {
  name: 'Betakah',
  version: '1.0.0',
  defaultLanguage: 'AR' as const,
};

// Limits
export const LIMITS = {
  maxPhotos: 50,
  maxVideos: 10,
  maxPhotoSize: 10 * 1024 * 1024, // 10MB
  maxVideoSize: 100 * 1024 * 1024, // 100MB
  maxPlusOnes: 10,
  maxEventTitleLength: 100,
  maxEventDescriptionLength: 1000,
  maxCommentLength: 500,
  maxCaptionLength: 500,
};

// OTP
export const OTP_CONFIG = {
  length: 6,
  expiresInSeconds: 300, // 5 minutes
  resendDelaySeconds: 60,
};

// Pagination
export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
};
