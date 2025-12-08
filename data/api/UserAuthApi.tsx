// data/api/UserAuthApi.tsx
import axios from "axios";
import { LOCAL_HOST } from "@env";

export const authApi = axios.create({
    baseURL: LOCAL_HOST,
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
