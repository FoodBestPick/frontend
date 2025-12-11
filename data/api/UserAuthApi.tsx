import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";

// 1. Axios 인스턴스 생성
console.log("[UserAuthApi] Using API_BASE_URL:", API_BASE_URL);
export const authApi = axios.create({
    baseURL: API_BASE_URL,            
    withCredentials: true,
});

// 2. 요청 인터셉터 (Request Interceptor)
// : 요청 보낼 때마다 헤더에 'Bearer 토큰' 자동 탑재
authApi.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem("accessToken");

            // 헤더가 undefined일 경우를 대비해 초기화
            if (!config.headers) {
                config.headers = {} as any;
            }

            if (token) {
                // ⚠️ 대괄호 표기법이 가장 안전합니다.
                config.headers['Authorization'] = `Bearer ${token}`;
                console.log(`🔑 [API 요청] 토큰 장착 완료! -> ${config.url}`);
            } else {
                console.warn(`⚠️ [API 요청] 토큰 없음 (로그인 필요) -> ${config.url}`);
            }
        } catch (error) {
            console.error("Token load error", error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. 응답 인터셉터 (Response Interceptor)
// : 401 에러(토큰 만료) 발생 시, 자동으로 토큰 갱신 후 재요청
authApi.interceptors.response.use(
    (response) => response, // 성공하면 그냥 통과
    async (error) => {
        const originalRequest = error.config;

        // 401 에러가 떴고, 아직 재시도 안 한 요청이라면
        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log("🚨 [401 감지] 토큰 만료됨. 갱신 시도 중...");

            originalRequest._retry = true; // 재시도 플래그 설정

            try {
                // 1) 토큰 갱신 요청 (기존 authApi 말고 쌩 axios로 요청)
                // RefreshToken은 HttpOnly Cookie로 자동 전송됨 (withCredentials: true 필요할 수 있음, axios 기본설정 확인)
                const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
                    withCredentials: true
                });

                // 2) 새 토큰 받아서 저장 (서버 응답 구조에 맞춰 수정 필요)
                const newAccessToken = res.data?.data?.accessToken || res.data?.accessToken;

                if (newAccessToken) {
                    console.log("✅ [토큰 갱신 성공] 새 토큰으로 재요청합니다.");
                    await AsyncStorage.setItem("accessToken", newAccessToken);

                    // 3) 실패했던 요청의 헤더를 새 토큰으로 교체하고 재전송
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return authApi(originalRequest);
                }

            } catch (refreshError) {
                console.error("❌ [토큰 갱신 실패] 로그아웃 처리합니다.", refreshError);
                await AsyncStorage.multiRemove(["accessToken", "isAutoLogin", "isAdmin"]);
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);