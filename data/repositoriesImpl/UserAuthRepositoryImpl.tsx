import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserAuthRepository } from "../../domain/repositories/UserAuthRepository";
import { authApi } from "../api/UserAuthApi";
import { API_BASE_URL } from "@env";

export const UserAuthRepositoryImpl: UserAuthRepository = {
    async checkNickname(nickname: string): Promise<boolean> {
        try {
            const response = await authApi.post("/auth/check-nickname", { nickname });
            const { code, data } = response.data;

            // Handle mixed return types from server (boolean, string, null)
            if (code === 200) {
                const validPositiveResponses = [true, "true", "사용가능"];
                const validNegativeResponses = [false, "false", null];
                
                if (validPositiveResponses.includes(data) || validNegativeResponses.includes(data)) {
                    // Interpreting specific "available" signals as true, everything else as potentially false?
                    // Original logic was: if (data === null || data === false ... ) return true;
                    // Wait, the original logic returned TRUE for null/false/"false"/"true"/"사용가능".
                    // This implies ANY successful 200 response with these values meant "Nickname is usable" (i.e. not taken).
                    // If it was taken, maybe it returns 409 or a different code?
                    // I will preserve the original logic's intent:
                    return true;
                }
            }
            return false;
        } catch (error: any) {
            if (error.response?.status === 409) return false; // Nickname conflict
            console.error("[UserAuthRepository] checkNickname error:", error);
            return false;
        }
    },

    async sendSignupEmail(email: string): Promise<void> {
        await authApi.post("/auth/email-send/signup", { email });
    },

    async sendPasswordResetEmail(email: string): Promise<void> {
        await authApi.post("/auth/email-send/password/reset", { email });
    },

    async verifyEmail(email: string, code: string): Promise<void> {
        await authApi.post("/auth/email-verify", { email, code });
    },

    async signup(payload: any): Promise<void> {
        await authApi.post("/auth/signup", payload);
    },

    async signin(payload: { email: string; password: string }) {
        const response = await authApi.post("/auth/signin", payload);
        const rawData = response.data;

        // console.log("[UserAuthRepository] Signin Response:", JSON.stringify(rawData, null, 2)); // Temporarily added log, now removed

        // Normalize data structure (handle { data: ... } vs flat response)
        let tokenData = rawData.data || rawData;
        
        // Handle nested 'token' object if present
        if (tokenData && typeof tokenData === 'object' && 'token' in tokenData) {
            tokenData = tokenData.token;
        }

        const userData = rawData.user || {};
        const userId = userData.id; // Extract userId here!

        // Determine admin privileges
        const isAdmin =
            tokenData.isAdmin === true ||
            userData.admin === true ||
            tokenData.role === "ADMIN" ||
            tokenData.role === "ROLE_ADMIN";

        // Extract accessToken only (refreshToken is HttpOnly cookie)
        const accessToken = tokenData.accessToken || tokenData.access_token;

        if (!accessToken) {
            console.warn("[UserAuthRepository] AccessToken missing in signin response");
        }

        return {
            accessToken,
            isAdmin,
            userId, // ✨ Add userId to the return object
        };
    },

    async logout(): Promise<void> {
        try {
            await authApi.post("/auth/logout");
        } catch (error) {
            console.warn("[UserAuthRepository] Logout API call failed, proceeding to clear local storage.");
        } finally {
            await AsyncStorage.multiRemove(["accessToken", "refreshToken", "isAutoLogin", "isAdmin"]);
        }
    },

    async deleteAccount(password: string, passwordConfirm: string): Promise<void> {
        await authApi.delete("/user/profile/delete", {
            data: { password, passwordConfirm }
        });
    },

    async getMyProfile() {
        const response = await authApi.get("/user/profile");
        const data = response.data.data || response.data;
        return {
            email: data.email,
            nickname: data.nickname,
            profileImage: data.image || data.profileImage,
            stateMessage: data.stateMessage,
        };
    },

    async updateProfile(data: { nickname: string; stateMessage: string; file?: any }): Promise<void> {
        // If there's a file, we might need to use uploadProfileImage or a multipart request here.
        // For now, assuming this endpoint handles text updates.
        // If 'file' is present, the logic might need to be split or handled via multipart.
        // Given the interface, I'll send the text data.
        await authApi.put("/user/profile", {
            nickname: data.nickname,
            stateMessage: data.stateMessage
        });
        
        // If file exists, upload it separately (common pattern if PUT /profile is JSON only)
        if (data.file) {
            await this.uploadProfileImage(data.file.uri);
        }
    },

    async uploadProfileImage(imageUri: string): Promise<void> {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) throw new Error("Authentication required for upload");

        const formData = new FormData();
        const filename = imageUri.split('/').pop() || 'profile.jpg';
        const type = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

        formData.append('file', {
            uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
            name: filename,
            type: type,
        } as any);

        try {
            const response = await fetch(`${API_BASE_URL}/user/profile`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                    "Accept": "application/json",
                },
                body: formData,
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Image upload failed (${response.status}): ${text}`);
            }
        } catch (error: any) {
            console.error("[UserAuthRepository] uploadProfileImage error:", error.message);
            throw error;
        }
    },

    async registerFcmToken(token: string): Promise<void> {
        await authApi.post("/user/fcm-token", { fcmToken: token });
    },

    async getUserProfile(userId: number) {
        const response = await authApi.get(`/user/${userId}/profile`);
        const data = response.data.data || response.data;
        return {
            email: data.email,
            nickname: data.nickname,
            profileImage: data.image || data.profileImage,
            stateMessage: data.stateMessage,
        };
    },

    async changePassword(payload: {
        newPassword: string;
        confirmNewPassword: string;
    }): Promise<void> {
        // 백엔드 MyPagePasswordRequest DTO: { password, passwordConfirm }
        // 현재 비밀번호 검증 없이 새 비밀번호로 바로 리셋하는 구조로 추정됨
        await authApi.post("/user/password/reset", {
            password: payload.newPassword,
            passwordConfirm: payload.confirmNewPassword
        });
    },

    async resetPassword(payload: {
        email: string;
        password: string;
        passwordConfirm: string;
        code: string;
    }): Promise<void> {
        await authApi.post("/auth/password/reset", payload);
    },
};
