import { AxiosInstance } from "axios";
import { API_BASE_URL } from "@env";
import CookieManager from '@react-native-cookies/cookies';

let fallbackToken: string | null = null;
export const setFallbackToken = (t: string | null) => {
    fallbackToken = t;
};

// ⭐ 토큰 갱신 중 동시 요청 방지를 위한 상태 변수
let isRefreshing = false;
let failedQueue: any[] = [];

// ⭐ 전역 로그아웃 콜백
let onUnauthorizedCallback: (() => void) | null = null;
export const setOnUnauthorizedCallback = (callback: (() => void) | null) => {
    onUnauthorizedCallback = callback;
};

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

export const setupInterceptors = (axiosInstance: AxiosInstance) => {
    axiosInstance.interceptors.request.use(
        async (config) => {
            config.withCredentials = true; 

            try {
                const cookies = await CookieManager.get(API_BASE_URL);
                const token = cookies.accessToken?.value || cookies.access_token?.value || fallbackToken;

                if (!config.headers) {
                    config.headers = {} as any;
                }

                if (token && !config.headers.Authorization) { 
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.error("Token load error from cookie", error);
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            const reqUrl: string = originalRequest?.url || "";
            if (reqUrl.includes("/auth/refresh")) {
                return Promise.reject(error);
            }

            // 401 에러 발생 시
            if (error.response?.status === 401 && !originalRequest._retry) {
                
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosInstance(originalRequest);
                    }).catch(err => {
                        return Promise.reject(err);
                    });
                }

                console.log("🚨 [401 감지] 토큰 만료됨. 갱신 시도 중...");
                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    await axiosInstance.post(`${API_BASE_URL}/auth/refresh`, {}, {
                        withCredentials: true
                    });
                    
                    const cookies = await CookieManager.get(API_BASE_URL);
                    const newToken = cookies.accessToken?.value || cookies.access_token?.value;

                    if (newToken) {
                        setFallbackToken(newToken);
                        if (!originalRequest.headers) {
                            originalRequest.headers = {} as any;
                        }
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        
                        console.log("✅ [토큰 갱신 성공] 대기 중인 요청들을 재시도합니다.");
                        processQueue(null, newToken);
                        isRefreshing = false;
                        return axiosInstance(originalRequest);
                    } else {
                        throw new Error("No token received after refresh");
                    }
                } catch (refreshError) {
                    console.error("❌ [토큰 갱신 실패] 로그아웃 처리가 필요합니다.", refreshError);
                    processQueue(refreshError, null);
                    isRefreshing = false;

                    // 🚨 [전역 로그아웃 콜백 호출]
                    if (onUnauthorizedCallback) {
                        onUnauthorizedCallback();
                    }

                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );
};
