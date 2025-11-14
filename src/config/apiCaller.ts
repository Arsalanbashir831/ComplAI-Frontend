import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { getCookie } from '@/lib/cookies';

type RequestData =
  | Record<string, string | number | boolean | File | Blob>
  | FormData;

const apiCaller = async (
  url: string,
  method: AxiosRequestConfig['method'] = 'GET',
  data?: RequestData,
  options: AxiosRequestConfig = {},
  useAuth: boolean = true,
  dataType: 'json' | 'formdata' = 'json',
  onErrorRefresh: boolean = false,
  signal?: AbortSignal
): Promise<AxiosResponse> => {
  const config: AxiosRequestConfig = {
    ...options,
    method,
    headers: {
      ...(options.headers || {}),
    },
    signal,
  };
  config.headers = {};
  if (useAuth) {
    // Read token from cookies (works in both client and server)
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      // Client-side: use cookie utility
      token = getCookie('accessToken');
    } else {
      // Server-side: tokens should be passed via headers or context
      // For now, we'll handle this in the API route handlers if needed
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  if (data) {
    if (dataType === 'json') {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    } else if (dataType === 'formdata') {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File || value instanceof Blob) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      });
      config.data = formData;
      delete config.headers['Content-Type'];
    }
  }

  try {
    const fullUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`;
    const response = await axios(fullUrl, config);
    return response;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (onErrorRefresh && typeof window !== 'undefined') {
        window.location.reload();
      }
      throw error;
    } else {
      throw { message: 'Network error or unknown error occurred' };
    }
  }
};

export default apiCaller;
