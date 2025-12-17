import axios from "axios";
import { API_BASE_URL } from "@env";
import { webSocketClient } from "../../core/utils/WebSocketClient"; 
import CookieManager from '@react-native-cookies/cookies';

// 1. Axios 인스턴스 생성
console.log("[UserAuthApi] Using API_BASE_URL:", API_BASE_URL);
export const authApi = axios.create({
    baseURL: API_BASE_URL,            
    withCredentials: true, // 쿠키 자동 포함
});

// 2. 요청 인터셉터 (Request Interceptor)
authApi.interceptors.request.use(
    async (config) => {
        try {
            // 🍪 쿠키 저장소에서 토큰을 꺼내옵니다.
            const cookies = await CookieManager.get(API_BASE_URL);
            const token = cookies.accessToken?.value || cookies.access_token?.value;

            // 헤더가 undefined일 경우를 대비해 초기화
            if (!config.headers) {
                config.headers = {} as any;
            }

            if (token) {
                // 서버가 헤더 방식을 원하므로, 쿠키에서 꺼낸 토큰을 헤더에 실어줍니다.
                config.headers.Authorization = `Bearer ${token}`;
                console.log(`🔑 [API 요청] 쿠키 기반 토큰 헤더 장착 완료! -> ${config.url}`);
            } else {
                console.warn(`⚠️ [API 요청] 쿠키에 토큰 없음 (로그인 필요) -> ${config.url}`);
            }
        } catch (error) {
            console.error("Token load error from cookies", error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. 응답 인터셉터 (Response Interceptor)
authApi.interceptors.response.use(
    (response) => response, 
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log("🚨 [401 감지] 토큰 만료됨. 갱신 시도 중...");
            originalRequest._retry = true; 

            try {
                // 1) 토큰 갱신 요청 (쿠키 기반)
                console.log(`🔄 [토큰 갱신 시도] URL: ${API_BASE_URL}/auth/refresh`);
                const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
                    withCredentials: true,
                });

                // 2) 갱신된 토큰 확보 (쿠키가 아닌 바디로 올 경우 대비)
                const newToken = res.data?.data?.accessToken || res.data?.accessToken;
                
                if (newToken) {
                    // 도메인 추출 및 쿠키 수동 업데이트
                    const domainMatch = API_BASE_URL.match(/:\/\/(.[^/:]+)/);
                    const domain = domainMatch ? domainMatch[1] : "13.125.213.115";
                    
                    await CookieManager.set(API_BASE_URL, {
                        name: 'accessToken',
                        value: newToken,
                        domain: domain,
                        path: '/',
                        version: '1',
                        expires: '2030-01-01T12:00:00.00-05:00'
                    });
                    
                    // 3) 실패했던 요청의 헤더를 새 토큰으로 교체
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                } else {
                    // 바디에 없으면 쿠키가 갱신되었을 것이라 가정하고 다시 읽음
                    const cookies = await CookieManager.get(API_BASE_URL);
                    const cookieToken = cookies.accessToken?.value || cookies.access_token?.value;
                    if (cookieToken) {
                        originalRequest.headers.Authorization = `Bearer ${cookieToken}`;
                    }
                }

                console.log("✅ [토큰 갱신 성공] 재요청합니다.");
                return authApi(originalRequest);

            } catch (refreshError: any) {
                console.error("❌ [토큰 갱신 실패] 로그아웃 처리합니다.", refreshError.message);
                try {
                    await CookieManager.clearAll();
                } catch (e) {}
                // 전역 웹소켓 연결 해제
                webSocketClient.disconnectGlobal();
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);