// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001/api',
};

// Authentication token declaration
export const AUTH_TOKEN_KEY = 'token';
export const AUTH_USER_KEY = 'user';

// Export configured token key for use in auth service
export { AUTH_TOKEN_KEY as TOKEN_KEY };

export default API_CONFIG;
