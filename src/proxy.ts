import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { API_ROUTES } from '@/constants/apiRoutes';
import { ROUTES } from '@/constants/routes';

const COOKIE_NAMES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

/**
 * Validate access token by calling backend API
 */
async function validateAccessToken(token: string): Promise<boolean> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error('NEXT_PUBLIC_BACKEND_URL is not set');
      return false;
    }

    const response = await fetch(
      `${backendUrl}${API_ROUTES.AUTH.VERIFY_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      }
    );

    return response.status === 200;
  } catch (error) {
    console.error('Error validating access token:', error);
    return false;
  }
}

/**
 * Refresh tokens by calling backend API
 */
async function refreshTokens(refreshToken: string): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error('NEXT_PUBLIC_BACKEND_URL is not set');
      return { accessToken: null, refreshToken: null };
    }

    const response = await fetch(
      `${backendUrl}${API_ROUTES.AUTH.REFRESH_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      }
    );

    if (response.status === 200) {
      const data = await response.json();
      return {
        accessToken: data.access || null,
        refreshToken: data.refresh || null,
      };
    }

    return { accessToken: null, refreshToken: null };
  } catch (error) {
    console.error('Error refreshing tokens:', error);
    return { accessToken: null, refreshToken: null };
  }
}

/**
 * Create a response with updated auth cookies
 */
function createResponseWithCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): NextResponse {
  // Set cookies with appropriate options
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: false, // Allow client-side access for apiCaller
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: accessToken ? 24 * 60 * 60 : undefined, // 1 day for access token
  };

  const refreshCookieOptions = {
    ...cookieOptions,
    maxAge: refreshToken ? 7 * 24 * 60 * 60 : undefined, // 7 days for refresh token
  };

  response.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, accessToken, cookieOptions);
  response.cookies.set(
    COOKIE_NAMES.REFRESH_TOKEN,
    refreshToken,
    refreshCookieOptions
  );

  return response;
}

/**
 * Clear auth cookies from response
 */
function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.delete(COOKIE_NAMES.ACCESS_TOKEN);
  response.cookies.delete(COOKIE_NAMES.REFRESH_TOKEN);
  return response;
}

/**
 * Build redirect URL preserving subscription parameter
 */
function buildRedirectUrl(
  baseUrl: string,
  subscription: string | null,
  request: NextRequest
): string {
  const url = new URL(baseUrl, request.url);
  if (subscription) {
    url.searchParams.set('subscription', subscription);
  }
  return url.toString();
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const subscription = searchParams.get('subscription');

  // Get tokens from cookies
  const accessToken = request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const refreshToken = request.cookies.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

  const isAuthPage = pathname.startsWith('/auth');
  const isApiRoute = pathname.startsWith('/api');
  const isStaticFile =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robot_icon') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|eot)$/);

  // Skip proxy for static files and API routes
  if (isStaticFile || isApiRoute) {
    return NextResponse.next();
  }

  // Handle protected routes (not auth pages)
  if (!isAuthPage) {
    // No tokens at all - redirect to auth
    if (!accessToken && !refreshToken) {
      const authUrl = buildRedirectUrl(ROUTES.LOGIN, subscription, request);
      const response = NextResponse.redirect(new URL(authUrl, request.url));
      return clearAuthCookies(response);
    }

    // Try to validate access token
    if (accessToken) {
      const isValid = await validateAccessToken(accessToken);
      if (isValid) {
        // Token is valid - continue
        return NextResponse.next();
      } else {
        // Access token invalid - try refresh
        if (refreshToken) {
          const tokens = await refreshTokens(refreshToken);
          if (tokens.accessToken && tokens.refreshToken) {
            // Successfully refreshed - set new cookies and continue
            const response = NextResponse.next();
            return createResponseWithCookies(
              response,
              tokens.accessToken,
              tokens.refreshToken
            );
          } else {
            // Refresh failed - redirect to auth
            const authUrl = buildRedirectUrl(
              ROUTES.LOGIN,
              subscription,
              request
            );
            const response = NextResponse.redirect(
              new URL(authUrl, request.url)
            );
            return clearAuthCookies(response);
          }
        } else {
          // No refresh token - redirect to auth
          const authUrl = buildRedirectUrl(ROUTES.LOGIN, subscription, request);
          const response = NextResponse.redirect(new URL(authUrl, request.url));
          return clearAuthCookies(response);
        }
      }
    }

    // Only refresh token exists - try to refresh
    if (refreshToken && !accessToken) {
      const tokens = await refreshTokens(refreshToken);
      if (tokens.accessToken && tokens.refreshToken) {
        // Successfully refreshed - set new cookies and continue
        const response = NextResponse.next();
        return createResponseWithCookies(
          response,
          tokens.accessToken,
          tokens.refreshToken
        );
      } else {
        // Refresh failed - redirect to auth
        const authUrl = buildRedirectUrl(ROUTES.LOGIN, subscription, request);
        const response = NextResponse.redirect(new URL(authUrl, request.url));
        return clearAuthCookies(response);
      }
    }
  }

  // Handle auth pages - redirect authenticated users away
  if (isAuthPage) {
    // If access token exists, validate it
    if (accessToken) {
      const isValid = await validateAccessToken(accessToken);
      if (isValid) {
        // Valid token - redirect to dashboard (user is authenticated)
        return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
      } else {
        // Invalid access token - try refresh
        if (refreshToken) {
          const tokens = await refreshTokens(refreshToken);
          if (tokens.accessToken && tokens.refreshToken) {
            // Successfully refreshed - user is authenticated, redirect to dashboard
            const response = NextResponse.redirect(
              new URL(ROUTES.DASHBOARD, request.url)
            );
            return createResponseWithCookies(
              response,
              tokens.accessToken,
              tokens.refreshToken
            );
          } else {
            // Refresh failed - tokens are invalid, allow access to auth page
            const response = NextResponse.next();
            return clearAuthCookies(response);
          }
        } else {
          // No refresh token - tokens are invalid, allow access to auth page
          const response = NextResponse.next();
          return clearAuthCookies(response);
        }
      }
    }

    // If only refresh token exists (no access token), try to refresh
    if (refreshToken && !accessToken) {
      const tokens = await refreshTokens(refreshToken);
      if (tokens.accessToken && tokens.refreshToken) {
        // Successfully refreshed - user is authenticated, redirect to dashboard
        const response = NextResponse.redirect(
          new URL(ROUTES.DASHBOARD, request.url)
        );
        return createResponseWithCookies(
          response,
          tokens.accessToken,
          tokens.refreshToken
        );
      } else {
        // Refresh failed - tokens are invalid, allow access to auth page
        const response = NextResponse.next();
        return clearAuthCookies(response);
      }
    }

    // No tokens at all - allow access to auth page (user is not authenticated)
    return NextResponse.next();
  }

  // Default: continue
  return NextResponse.next();
}

// Configure which paths the proxy should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)).*)',
  ],
};
