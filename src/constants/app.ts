/**
 * App Constants
 * Brand information, logos, and constants
 */

export const APP_NAME = 'Namos Legal AI';
export const APP_TAGLINE = 'AI-Powered Legal Assistant';
export const APP_DESCRIPTION = 'Your Intelligent Legal Companion';

// Logo - Using scale emoji as placeholder
// TODO: Replace with actual logo image from website
export const LOGO_EMOJI = '⚖️';
export const LOGO_TEXT = 'Namos';

// Support & Links
export const SUPPORT_EMAIL = 'support@namos-legal.com';
export const WEBSITE_URL = 'https://namos-legal.com';
export const TERMS_URL = `${WEBSITE_URL}/terms`;
export const PRIVACY_URL = `${WEBSITE_URL}/privacy`;

// API Configuration (from website backend)
export const API_BASE_URL = __DEV__
    ? 'http://localhost:3001/api'
    : 'https://api.namos-legal.com/api';

export const PYTHON_API_URL = __DEV__
    ? 'http://localhost:8000'
    : 'https://python-api.namos-legal.com';
