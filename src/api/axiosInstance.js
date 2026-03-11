import axios from "axios";
import Config from "../config";
import storageService from "../services/storageService";

const axiosInstance = axios.create({
    baseURL: Config.api.baseUrl,
    timeout: Config.api.timeout,
    headers: {
        "Content-Type": "application/json",
    },
});

// ─── Flag to prevent multiple refresh calls ──────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
        }
    });
    failedQueue = [];
};

// ─── Request Interceptor ─────────────────────────────
axiosInstance.interceptors.request.use(
    async (config) => {
        const token = await storageService.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Skip refresh logic for auth endpoints (login, register, etc.)
        const isAuthEndpoint = originalRequest.url?.startsWith("/auth/");

        // If 401 and not already retrying and not an auth endpoint
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            if (isRefreshing) {
                // Queue the request while token is being refreshed
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = await storageService.getRefreshToken();

                if (!refreshToken) {
                    throw new Error("No refresh token available");
                }

                const { data } = await axios.post(`${Config.api.baseUrl}/auth/refresh-token`, {
                    refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = data.data;

                await storageService.setAccessToken(accessToken);
                if (newRefreshToken) {
                    await storageService.setRefreshToken(newRefreshToken);
                }

                axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
                processQueue(null, accessToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                await storageService.clearAll();
                // The AuthContext will detect this and redirect to login
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
