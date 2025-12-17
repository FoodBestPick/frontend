import { AxiosInstance } from "axios";
import { API_BASE_URL } from "@env";
import CookieManager from '@react-native-cookies/cookies';

export const setupInterceptors = (axiosInstance: AxiosInstance) => {
    // 요청 인터셉터
    axiosInstance.interceptors.request.use(
        async (config) => {
            config.withCredentials = true; // 쿠키 포함 설정

            try {
                // 🍪 쿠키에서 토큰 조회
                const cookies = await CookieManager.get(API_BASE_URL);
                const token = cookies.accessToken?.value || cookies.access_token?.value;

                if (!config.headers) {
                    config.headers = {} as any;
                }

                if (token && !config.headers.Authorization) { 
                    // 쿠키에서 꺼낸 토큰을 헤더에 주입
                    config.headers.Authorization = `Bearer ${token}`;
                    // console.log(`🔑 [API 요청] 쿠키 토큰 헤더 탑재 -> ${config.url}`);
                }
            } catch (error) {
                console.error("Token load error from cookie", error);
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    // 응답 인터셉터
    axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            if (error.response?.status === 401 && !originalRequest._retry) {
                console.log("🚨 [401 감지] 토큰 만료됨. 갱신 시도 중...");
                originalRequest._retry = true;

                try {
                    // 쿠키 기반 갱신 요청
                    await axiosInstance.post(`${API_BASE_URL}/auth/refresh`, {}, {
                        withCredentials: true
                    });
                    
                    // 갱신된 쿠키에서 토큰 다시 읽기
                    const cookies = await CookieManager.get(API_BASE_URL);
                    const newToken = cookies.accessToken?.value || cookies.access_token?.value;

                    if (newToken) {
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