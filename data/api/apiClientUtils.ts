import { AxiosInstance } from "axios";
import { API_BASE_URL } from "@env";
import CookieManager from '@react-native-cookies/cookies';

let fallbackToken: string | null = null;
export const setFallbackToken = (t: string | null) => {
    fallbackToken = t;
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

if (error.response?.status === 401 && !originalRequest._retry) {
                console.log("🚨 [401 감지] 토큰 만료됨. 갱신 시도 중...");
                originalRequest._retry = true;

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
                    }

                    console.log("✅ [토큰 갱신 성공] 재요청합니다.");
                    return axiosInstance(originalRequest);
                } catch (refreshError) {
                    console.error("❌ [토큰 갱신 실패] 로그아웃 처리가 필요합니다.", refreshError);
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );
};