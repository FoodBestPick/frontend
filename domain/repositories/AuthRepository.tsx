import axios from "axios";
import { API_BASE_URL } from "@env";

export class AuthRepository {
    
    async kakaoLogin(kakaoToken: string) {
        const res = await axios.post(`${API_BASE_URL}/auth/signin/kakao`, {
            token: kakaoToken,
        }, { withCredentials: true });
        return res.data;
    }

    async googleLogin(googleToken: string) {
        const res = await axios.post(`${API_BASE_URL}/auth/signin/google`, {
            token: googleToken,
        }, { withCredentials: true });
        return res.data;
    }

    async naverLogin(naverToken: string) {
        const res = await axios.post(`${API_BASE_URL}/auth/signin/naver`, {
            token: naverToken,
        }, { withCredentials: true });
        return res.data;
    }
}