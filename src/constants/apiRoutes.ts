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
    GET_USER_CHATS: '/api/chats/user/',
    CREATE: '/api/chats/create/',
    ADD_MESSAGE: (chatId: string) => `/api/chats/${chatId}/messages/add/`,
    ADD_MESSAGE_STREAM: (chatId: string) =>
      `/api/chats/${chatId}/messages/add-stream/`,
    GET_MESSAGES: (chatId: string) => `/api/chats/${chatId}/messages/`,
    DELETE: '/api/chats/delete/',
  },
} as const;
