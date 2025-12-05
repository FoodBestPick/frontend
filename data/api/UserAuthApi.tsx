// data/api/UserAuthApi.tsx
import axios from "axios";

export const authApi = axios.create({
    baseURL: "http://10.0.2.2:8080", // TODO: 백엔드 주소로 교체
    withCredentials: true,
});

// 선택: 에러 로깅
authApi.interceptors.response.use(
    (res) => res,
    (error) => {
        console.log("[authApi error]", error?.response ?? error);
        return Promise.reject(error);
    }
);
