import axios from "axios";
import Config from "react-native-config";

const LOCAL_HOST = 'http://10.0.2.2:8080/api/v1';
const API_BASE_URL = Config.API_URL || LOCAL_HOST;

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