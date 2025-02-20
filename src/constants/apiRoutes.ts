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
  },
} as const;
