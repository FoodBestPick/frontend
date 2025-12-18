import axios from "axios";
import { API_BASE_URL } from "@env";
import { webSocketClient } from "./WebSocketClient"; // 필요한 경우

import { setupInterceptors } from './apiClientUtils'; // 인터셉터 유틸리티 임포트

// 1. Axios 인스턴스 생성
console.log("[UserAuthApi] Using API_BASE_URL:", API_BASE_URL);
export const authApi = axios.create({
    baseURL: API_BASE_URL,            
    withCredentials: true, // 쿠키 자동 포함
});

// 2. apiClientUtils.ts에서 인터셉터 설정 (여기서 직접 정의하지 않음)
setupInterceptors(authApi);

// (ChatApi 같은 다른 인스턴스에도 적용하려면 해당 파일에서 호출)
// export const chatApi = axios.create({ ... });
// setupInterceptors(chatApi);
