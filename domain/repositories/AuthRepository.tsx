import axios from "axios";

export class AuthRepository {
    
    async kakaoLogin(kakaoToken: string) {
        const res = await axios.post("http://172.30.1.17:8080/auth/signin/kakao", {
            token: kakaoToken,
        });
        return res.data;
    }

    async googleLogin(googleToken: string) {
        const res = await axios.post("http://172.30.1.17:8080/auth/signin/google", {
            token: googleToken,
        });
        return res.data;
    }
}