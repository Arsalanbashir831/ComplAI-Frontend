export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/users/login/',
    SIGNUP: '/api/users/register/',
    LOGOUT: '/api/users/logout/',
    VERIFY_EMAIL: '/api/users/verify-otp/',
    RESEND_VERIFICATION: '/api/users/resend-otp/',
    RESET_PASSWORD: '/api/users/reset-password/',
    CHANGE_PASSWORD: '/api/users/reset-password/',
    FORGOT_PASSWORD: '/api/users/request-password-reset/',
    VERIFY_TOKEN: '/api/token/verify/',
    REFRESH_TOKEN: '/api/token/refresh/',
  },
  USER: {
    GET_USER_DATA: '/api/users/profile/',
    GET_TOKENS_SUMMARY: '/api/users/tokens/',
    GET_TOKENS_HISTORY: '/api/users/tokens-history/',
  },
  CHAT: {
    GET_INTERACTION_HISTORY: '/api/chats/token-usage/',
  },
} as const;
