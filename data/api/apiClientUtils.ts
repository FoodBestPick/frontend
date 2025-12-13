import { AxiosInstance } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";

export const setupInterceptors = (axiosInstance: AxiosInstance) => {
    // 요청 인터셉터
    axiosInstance.interceptors.request.use(
        async (config) => {
            try {
                const token = await AsyncStorage.getItem("accessToken");
                if (!config.headers) {
                    config.headers = {} as any;
                }
                if (token && !config.headers['Authorization']) { // 헤더에 Authorization이 없을 때만 추가
                    config.headers['Authorization'] = `Bearer ${token}`;
                    console.log(`🔑 [API 요청] 토큰 장착 완료! -> ${config.url}`);
                } else if (!config.headers['Authorization']) { // 헤더에 Authorization이 없고, 토큰도 없을 때 경고
                    console.warn(`⚠️ [API 요청] 토큰 없음 (로그인 필요) -> ${config.url}`);
                }
            } catch (error) {
                console.error("Token load error", error);
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
                    const res = await axiosInstance.post(`${API_BASE_URL}/auth/refresh`, {}, {
                        withCredentials: true
                    });
                    const newAccessToken = res.data?.data?.accessToken || res.data?.accessToken;

                    if (newAccessToken) {
                        console.log("✅ [토큰 갱신 성공] 새 토큰으로 재요청합니다.");
                        await AsyncStorage.setItem("accessToken", newAccessToken);
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        return axiosInstance(originalRequest);
                    }
                } catch (refreshError) {
                    console.error("❌ [토큰 갱신 실패] 로그아웃 처리합니다.", refreshError);
                    await AsyncStorage.multiRemove(["accessToken", "isAutoLogin", "isAdmin"]);
                    // 여기서 로그아웃 처리가 필요할 수 있습니다. (예: navigate to login screen)
                    // 현재 AuthContext는 ViewModel에서 접근해야 하므로, 직접 navigate하는 것은 지양합니다.
                    // 대신, Promise.reject를 통해 호출자에게 오류를 전달합니다.
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );
};