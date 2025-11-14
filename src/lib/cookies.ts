/**
 * Cookie utility functions for authentication token management
 * Supports both client-side and server-side cookie operations
 */

interface CookieOptions {
  expires?: number | Date;
  maxAge?: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  httpOnly?: boolean;
}

const COOKIE_NAMES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

/**
 * Set a cookie with the given name, value, and options
 * Works in both browser and server environments
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  if (typeof window === 'undefined') {
    // Server-side: cookies are set via response headers in Proxy/API routes
    return;
  }

  const {
    expires,
    maxAge,
    domain,
    path = '/',
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'lax',
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (expires) {
    if (expires instanceof Date) {
      cookieString += `; expires=${expires.toUTCString()}`;
    } else {
      const date = new Date();
      date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000);
      cookieString += `; expires=${date.toUTCString()}`;
    }
  }

  if (maxAge) {
    cookieString += `; max-age=${maxAge}`;
  }

  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  cookieString += `; path=${path}`;

  if (secure) {
    cookieString += '; secure';
  }

  cookieString += `; samesite=${sameSite}`;

  document.cookie = cookieString;
}

/**
 * Get a cookie value by name
 * Works in both browser and server environments
 */
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') {
    // Server-side: cookies are read from request headers
    return null;
  }

  const nameEQ = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
    }
  }

  return null;
}

/**
 * Delete a cookie by setting it to expire immediately
 */
export function deleteCookie(
  name: string,
  options: Pick<CookieOptions, 'domain' | 'path'> = {}
): void {
  const { domain, path = '/' } = options;
  setCookie(name, '', {
    expires: new Date(0),
    domain,
    path,
  });
}

/**
 * Set both authentication cookies (accessToken and refreshToken)
 * Also clears any existing tokens from localStorage to prevent conflicts
 */
export function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  options: Omit<CookieOptions, 'httpOnly'> = {}
): void {
  // Clear any existing tokens from localStorage (migration safeguard)
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Access tokens expire in 1 day (typical JWT expiry)
  // Refresh tokens expire in 7 days
  const accessTokenExpires = 1; // days
  const refreshTokenExpires = 7; // days

  setCookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
    ...options,
    expires: accessTokenExpires,
    secure: options.secure ?? process.env.NODE_ENV === 'production',
    sameSite: options.sameSite ?? 'lax',
  });

  setCookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
    ...options,
    expires: refreshTokenExpires,
    secure: options.secure ?? process.env.NODE_ENV === 'production',
    sameSite: options.sameSite ?? 'lax',
  });

  // Verify cookies were set (development only)
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    const verifyAccess = getCookie(COOKIE_NAMES.ACCESS_TOKEN);
    const verifyRefresh = getCookie(COOKIE_NAMES.REFRESH_TOKEN);
    if (!verifyAccess || !verifyRefresh) {
      console.warn(
        '[setAuthCookies] Warning: Cookies may not have been set correctly',
        { accessSet: !!verifyAccess, refreshSet: !!verifyRefresh }
      );
    }
  }
}

/**
 * Get both authentication cookies
 * Returns null for either token if not found
 */
export function getAuthCookies(): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  return {
    accessToken: getCookie(COOKIE_NAMES.ACCESS_TOKEN),
    refreshToken: getCookie(COOKIE_NAMES.REFRESH_TOKEN),
  };
}

/**
 * Clear both authentication cookies
 */
export function clearAuthCookies(
  options: Pick<CookieOptions, 'domain' | 'path'> = {}
): void {
  deleteCookie(COOKIE_NAMES.ACCESS_TOKEN, options);
  deleteCookie(COOKIE_NAMES.REFRESH_TOKEN, options);
}

/**
 * Cookie names for reference
 */
export { COOKIE_NAMES };
