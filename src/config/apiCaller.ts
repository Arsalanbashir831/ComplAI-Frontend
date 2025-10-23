import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

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
  if (useAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
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
