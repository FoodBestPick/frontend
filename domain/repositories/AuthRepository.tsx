import axios from "axios";
import { LOCAL_HOST } from "@env";

export class AuthRepository {
    
    async kakaoLogin(kakaoToken: string) {
        const res = await axios.post(`${LOCAL_HOST}/auth/signin/kakao`, {
            token: kakaoToken,
        });
        return res.data;
    }

    async googleLogin(googleToken: string) {
        const res = await axios.post(`${LOCAL_HOST}/auth/signin/google`, {
            token: googleToken,
        });
        return res.data;
    }

    async naverLogin(naverToken: string) {
        const res = await axios.post(`${LOCAL_HOST}/auth/signin/naver`, {
            token: naverToken,
        });
        return res.data;
    }
}