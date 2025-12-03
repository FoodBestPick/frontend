import { UserAuthRepository } from "../../domain/repositories/UserAuthRepository";
import { authApi } from "../api/UserAuthApi";

export const UserAuthRepositoryImpl: UserAuthRepository = {
    // 1. 닉네임 중복 확인
    async checkNickname(nickname: string): Promise<boolean> {
        try {
            const response = await authApi.post("/auth/check-nickname", { nickname });
            const { code, data } = response.data;
            if (code === 200) {
                if (data === null) return true;
                if (data === false || data === "false") return true;
                if (data === true || data === "true" || data === "사용가능") return true;
            }
            return false;
        } catch (error: any) {
            if (error.response?.status === 409) return false;
            console.error("닉네임 체크 에러:", error);
            return false;
        }
    },

    async sendSignupEmail(email) {
        await authApi.post("/auth/email-send/signup", { email });
    },

    async sendPasswordResetEmail(email) {
        await authApi.post("/auth/email-send/password/reset", { email });
    },

    async verifyEmail(email, code) {
        await authApi.post("/auth/email-verify", { email, code });
    },

    async signup(payload) {
        await authApi.post("/auth/signup", payload);
    },

    // ⭐ [핵심 수정] 로그인 응답 파싱 수정 (res.data.data)
    async signin(payload) {
        const res = await authApi.post("/auth/signin", payload);

        // 디버깅용 로그: 백엔드가 데이터를 어떻게 주는지 확인해보세요!
        console.log("[로그인 응답 데이터]", res.data);

        // 💥 수정 전: res.data.accessToken (여기엔 토큰이 없어서 undefined였음)
        // 🟢 수정 후: res.data.data.accessToken (data 안에 한 번 더 들어가야 함)
        const responseData = res.data.data || res.data; // 혹시 몰라 안전장치 추가

        return {
            accessToken: responseData.accessToken,
            refreshToken: responseData.refreshToken,
        };
    },

    async resetPassword(payload) {
        await authApi.post("/auth/password/reset", payload);
    },
};