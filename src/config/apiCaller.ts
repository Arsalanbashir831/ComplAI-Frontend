import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const apiCaller = async (url: string, options: AxiosRequestConfig = {}, useAuth: boolean = true): Promise<AxiosResponse> => {
    const config: AxiosRequestConfig = {
        ...options,
        headers: {
            ...(options.headers || {}),
        },
    };

    if (useAuth) {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    try {
        const fullUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`;
        const response = await axios(fullUrl, config);
        return response;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            switch (status) {
                case 400:
                    console.error('Bad Request: The server could not understand the request.', error.response?.data);
                    break;
                case 401:
                    console.error('Unauthorized: Invalid or missing authentication token.', error.response?.data);
                    break;
                case 403:
                    console.error('Forbidden: You do not have permission to access this resource.', error.response?.data);
                    break;
                case 404:
                    console.error('Not Found: The requested resource was not found.', error.response?.data);
                    break;
                case 500:
                    console.error('Internal Server Error: Something went wrong on the server.', error.response?.data);
                    break;
                case 503:
                    console.error('Service Unavailable: The server is currently unavailable.', error.response?.data);
                    break;
                default:
                    console.error(`Unexpected Error (Status: ${status}):`, error.response?.data);
            }
        } else {
            console.error('Network Error or Unknown Error:', (error as Error).message);
        }
        throw error;
    }
};

export default apiCaller;
