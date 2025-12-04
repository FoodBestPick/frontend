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
            if (error.response?.status === 409) {
                console.log("[Repository] 닉네임 중복됨 (정상)");
                return false;
            }
            console.error("닉네임 체크 시스템 에러:", error);
            return false;
        }
    },

    // 2. 이메일 관련 기능
    async sendSignupEmail(email) {
        await authApi.post("/auth/email-send/signup", { email });
    },

    async sendPasswordResetEmail(email) {
        await authApi.post("/auth/email-send/password/reset", { email });
    },

    async verifyEmail(email, code) {
        await authApi.post("/auth/email-verify", { email, code });
    },

    // 3. 회원가입
    async signup(payload) {
        await authApi.post("/auth/signup", payload);
    },

    // 4. ⭐ [핵심 수정] 로그인 (user.admin 위치 수정)
    async signin(payload) {
        const res = await authApi.post("/auth/signin", payload);

        const rawData = res.data;

        // 1. 토큰은 data 안에 있음
        const tokenData = rawData.data || {};

        // 2. 관리자 정보는 user 객체 안에 있음! (user.admin)
        const userData = rawData.user || {};

        console.log("==========================================");
        console.log("📢 [로그인 응답 원본]:", JSON.stringify(rawData, null, 2));

        // ⭐ 핵심: user.admin 값을 확인 (true면 관리자)
        const isAdmin = userData.admin === true;

        console.log(`🕵️ [관리자 판별 결과]: ${isAdmin ? "👑 관리자(Admin)" : "👤 일반 유저(User)"}`);
        console.log("==========================================");

        return {
            accessToken: tokenData.accessToken,
            refreshToken: tokenData.refreshToken,
            isAdmin: isAdmin, // 올바른 위치에서 가져온 값
        };
    },

    // 5. 비밀번호 재설정
    async resetPassword(payload) {
        await authApi.post("/auth/password/reset", payload);
    },
};