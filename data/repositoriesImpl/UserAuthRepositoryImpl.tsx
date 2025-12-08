import { UserAuthRepository } from "../../domain/repositories/UserAuthRepository";
import { authApi } from "../api/UserAuthApi";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserAuthRepositoryImpl: UserAuthRepository = {
    // 1. 닉네임 중복 확인
    async checkNickname(nickname: string): Promise<boolean> {
        try {
            const response = await authApi.post("/auth/check-nickname", { nickname });
            const { code, data } = response.data;
            if (code === 200) {
                if (data === null || data === false || data === "false" || data === true || data === "true" || data === "사용가능") return true;
            }
            return false;
        } catch (error: any) {
            if (error.response?.status === 409) return false;
            console.error("닉네임 체크 에러:", error);
            return false;
        }
    },

    // 2. 이메일 관련
    async sendSignupEmail(email) { await authApi.post("/auth/email-send/signup", { email }); },
    async sendPasswordResetEmail(email) { await authApi.post("/auth/email-send/password/reset", { email }); },
    async verifyEmail(email, code) { await authApi.post("/auth/email-verify", { email, code }); },

    // 3. 회원가입
    async signup(payload) { await authApi.post("/auth/signup", payload); },

    // 4. 로그인
    async signin(payload) {
        const res = await authApi.post("/auth/signin", payload);
        const rawData = res.data;

        const tokenData = rawData.data || rawData;
        const userData = rawData.user || {};

        const isAdmin =
            tokenData.isAdmin === true ||
            userData.admin === true ||
            tokenData.role === "ADMIN" ||
            tokenData.role === "ROLE_ADMIN";

        return {
            accessToken: tokenData.accessToken,
            isAdmin: isAdmin,
        };
    },

    // 5. 비번 재설정
    async resetPassword(payload) { await authApi.post("/auth/password/reset", payload); },

    // 6. 내 프로필 조회
    async getMyProfile() {
        const res = await authApi.get("/user/profile");
        const data = res.data.data;
        return {
            email: data.email,
            nickname: data.nickname,
            profileImage: data.image,
            stateMessage: data.stateMessage,
        };
    },

    // 7. 내 프로필 수정
    async updateProfile(data) {
        console.log("🚀 [Repository] 프로필 수정 요청...");
        const formData = new FormData();
        formData.append("nickname", data.nickname || "");
        formData.append("stateMessage", data.stateMessage || "");

        if (data.file) {
            const fileType = data.file.type || 'image/jpeg';
            const extension = fileType.split('/')[1] || 'jpg';
            const safeName = data.nickname || `user_${Date.now()}`;
            const newFileName = `${safeName}.${extension}`;
            const localUri = data.file.uri;
            const finalUri = Platform.OS === 'ios' && localUri.startsWith('file://')
                ? localUri.replace('file://', '')
                : localUri;

            formData.append("file", {
                uri: finalUri,
                type: fileType,
                name: newFileName,
            } as any);
        }

        try {
            const token = await AsyncStorage.getItem("accessToken");
            const response = await fetch("http://10.0.2.2:8080/user/profile", {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json",
                },
                body: formData,
            });
            const responseText = await response.text();
            if (!response.ok) throw new Error(`업로드 실패 (${response.status}): ${responseText}`);
        } catch (error: any) {
            console.error("❌ [fetch 에러]:", error.message);
            throw error;
        }
    },

    // 8. 나머지 기능들
    async registerFcmToken(token) { await authApi.post("/user/fcm-token", { fcmToken: token }); },
    async deleteAccount(pw, confirm) { await authApi.delete("/user/profile/delete", { data: { password: pw, passwordConfirm: confirm } }); },
    async getUserProfile(userId) {
        const res = await authApi.get(`/user/${userId}/profile`);
        const data = res.data.data;
        return {
            email: data.email,
            nickname: data.nickname,
            profileImage: data.image,
            stateMessage: data.stateMessage,
        };
    },

    // ⭐ [추가됨] 비밀번호 변경 구현
    async changePassword(payload) {
        // authApi가 헤더에 토큰을 자동으로 넣어줍니다.
        // 엔드포인트는 서버 명세에 따라 수정하세요 (예: /api/members/password)
        await authApi.patch("/api/members/password", payload);
    },
};