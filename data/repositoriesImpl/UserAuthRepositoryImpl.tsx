import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CookieManager from '@react-native-cookies/cookies'; // ✨ 쿠키 매니저 추가
import axios from 'axios'; // ✨ axios 임포트 추가
import { UserAuthRepository } from "../../domain/repositories/UserAuthRepository";
import { authApi } from "../api/UserAuthApi";
import { API_BASE_URL } from "@env";
import messaging from '@react-native-firebase/messaging'; // FCM 토큰 가져오기 위해 추가

export const UserAuthRepositoryImpl: UserAuthRepository = {
    async checkNickname(nickname: string): Promise<boolean> {
        try {
            const response = await authApi.post("/auth/check-nickname", { nickname });
            const { code, data } = response.data;

            if (code === 200) {
                const validPositiveResponses = [true, "true", "사용가능"];
                const validNegativeResponses = [false, "false", null];
                
                if (validPositiveResponses.includes(data) || validNegativeResponses.includes(data)) {
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

        let tokenData = rawData.data || rawData;
        
        if (tokenData && typeof tokenData === 'object' && 'token' in tokenData) {
            tokenData = tokenData.token;
        }

        const userData = rawData.user || (rawData.data && rawData.data.user) || {};
        const userId = userData.id;

        const userRole = (tokenData.role || userData.role || "").toString().toUpperCase();
        const authorities = tokenData.authorities || userData.authorities || [];
        
        console.log("🔍 [UserAuthRepository] Checking Role:", userRole);
        console.log("🔍 [UserAuthRepository] Checking Authorities:", JSON.stringify(authorities));

        const isAdmin =
            tokenData.isAdmin === true ||
            userData.admin === true ||
            userRole === "ADMIN" ||
            userRole === "ROLE_ADMIN" ||
            (Array.isArray(authorities) && authorities.some((auth: any) => {
                const authRole = (auth.authority || auth.role || auth).toString().toUpperCase();
                return authRole === "ADMIN" || authRole === "ROLE_ADMIN";
            }));
        
        console.log("✅ [UserAuthRepository] Calculated isAdmin:", isAdmin);

        // ✅ accessToken 변수를 여기서 선언합니다.
        const accessToken = tokenData.accessToken || tokenData.access_token;
        
        // ✨ accessToken을 쿠키로 강제 설정 (서버가 Set-Cookie를 안 줄 경우 대비)
        if (accessToken) {
            try {
                console.log(`🍪 [UserAuthRepository] accessToken 수동 설정. URL: ${API_BASE_URL}, Token: ${accessToken.substring(0, 10)}...`);
                
                await CookieManager.set(API_BASE_URL, {
                    name: 'accessToken',
                    value: accessToken,
                    path: '/',
                    version: '1'
                });
                // ✨ Refresh Token도 쿠키로 저장합니다.
                if (rawData.refreshToken) {
                    await CookieManager.set(API_BASE_URL, {
                        name: 'refreshToken', // refreshToken 이름으로 저장
                        value: rawData.refreshToken,
                        path: '/',
                        version: '1' // expires 필드 제거
                    });
                    console.log("✅ [UserAuthRepository] refreshToken 수동 설정 완료.");
                }

                console.log("✅ [UserAuthRepository] 쿠키 설정 완료.");
            } catch (cookieError) {
                console.error("❌ [UserAuthRepository] 쿠키 설정 실패:", cookieError);
            }
        }
        
        return {
            isAdmin,
            userId, // ✨ userId는 필요하므로 반환
            accessToken: accessToken || "",
            refreshToken: rawData.refreshToken || "",
        };
    },

    async logout(): Promise<void> {
        try {
            await authApi.post("/auth/logout");
        } catch (error) {
            console.warn("[UserAuthRepository] Logout API call failed, proceeding to clear local storage.");
        } finally {
            try {
                await CookieManager.clearAll();
                console.log("🧹 [UserAuthRepository] 쿠키 삭제 완료");
            } catch (e) {
                console.error("❌ 쿠키 삭제 실패:", e);
            }
            // AccessToken, RefreshToken은 쿠키로 관리되므로 AsyncStorage에서 제거할 필요 없음.
            // isAutoLogin, isAdmin, userId는 AsyncStorage에 남아있을 수 있지만,
            // 실제 로그아웃 시 isLoggedIn 상태가 false로 바뀌면 사용되지 않음.
            // 여기서는 AuthContext에서 개별적으로 처리하도록 맡깁니다.
            await AsyncStorage.multiRemove([]); // 빈 배열로 변경하여 아무것도 지우지 않음.
        }
    },

    async deleteAccount(password: string, passwordConfirm: string): Promise<void> {
        await authApi.delete("/user/profile/delete", {
            data: { password, passwordConfirm }
        });
    },

    // 1. 내 프로필 조회
    async getMyProfile(): Promise<{
        email: string;
        nickname: string;
        profileImage: string | null;
        stateMessage: string | null;
    }> {
        const response = await authApi.get("/user/profile");
        const data = response.data.data || response.data;
        return {
            email: data.email,
            nickname: data.nickname,
            profileImage: data.image || data.profileImage,
            stateMessage: data.stateMessage,
        };
    },

    // 2. 내 프로필 수정
    async updateProfile(data: { nickname: string; stateMessage: string; file?: any }): Promise<void> {
        const formData = new FormData();
        formData.append("nickname", data.nickname);
        formData.append("stateMessage", data.stateMessage);

        if (data.file) {
            const imageUri = data.file.uri;
            const filename = imageUri.split('/').pop() || 'profile.jpg';
            const type = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

            formData.append('file', {
                uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
                name: filename,
                type: type,
            } as any);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/user/profile`, {
                method: "PUT",
                headers: {
                    "Accept": "application/json",
                },
                body: formData,
                credentials: 'include', // ✨ credentials: 'include' 추가
            });

            if (!response.ok) {
                const text = await response.text();
                try {
                    const json = JSON.parse(text);
                    if (json.message) {
                         throw new Error(json.message);
                    }
                } catch (e) {
                }
                throw new Error(`프로필 수정 실패 (${response.status}): ${text}`);
            }
        } catch (error: any) {
            console.error("[UserAuthRepository] updateProfile error:", error.message);
            throw error;
        }
    },

    // ⭐ 프로필 이미지 업로드
    async uploadProfileImage(imageUri: string): Promise<void> {
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
                    "Content-Type": "multipart/form-data",
                    "Accept": "application/json",
                },
                body: formData,
                credentials: 'include', // ✨ credentials: 'include' 추가
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

    // 3. FCM 토큰 등록
    async registerFcmToken(): Promise<void> {
        const fcmToken = await messaging().getToken(); // ✨ messaging().getToken() 직접 호출
        if (!fcmToken) {
            console.warn("[UserAuthRepository] FCM Token을 가져올 수 없습니다.");
            return;
        }
        await authApi.post("/user/fcm-token", { fcmToken: fcmToken });
    },

    // 5. 타인 프로필 조회
    async getUserProfile(userId: number): Promise<{
        email: string;
        nickname: string;
        profileImage: string | null;
        stateMessage: string | null;
    }> {
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

    // ✨ Access Token을 갱신하는 함수
    async refreshAccessToken(): Promise<void> { // ✨ Promise<string> -> Promise<void> 로 변경
        console.log("🔄 [UserAuthRepository] Access Token 갱신 시도 중...");
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
                withCredentials: true,
                headers: {
                    'Content-Type': "application/json",
                }
            });

            console.log("🔍 [UserAuthRepository] refreshAccessToken 서버 응답:", res.data); // 서버 응답 전체 로그

            // 서버 응답 본문에서 새로운 토큰 추출 (예시: res.data.accessToken)
            const newAccessToken = res.data.data?.accessToken; // ApiResponse<TokenResponse> 구조에 맞춰 추출
            console.log("🔍 [UserAuthRepository] 추출된 newAccessToken:", newAccessToken ? newAccessToken.substring(0, 10) + '...' : '없음');

            if (newAccessToken) {
                await CookieManager.set(API_BASE_URL, {
                    name: 'accessToken',
                    value: newAccessToken,
                    path: '/',
                    version: '1',
                    expires: '2030-01-01T12:00:00.00-05:00'
                });
                console.log("✅ [UserAuthRepository] Access Token 갱신 성공 및 쿠키 업데이트.");

                // ✨ 방금 저장한 쿠키가 제대로 읽히는지 즉시 확인
                const storedCookies = await CookieManager.get(API_BASE_URL);
                const verifiedToken = storedCookies.accessToken?.value;
                console.log("🔍 [UserAuthRepository] CookieManager에서 방금 확인된 토큰:", verifiedToken ? verifiedToken.substring(0, 10) + '...' : '없음');

            } else {
                console.warn("⚠️ [UserAuthRepository] Access Token 갱신 성공, 하지만 응답에서 새 토큰을 찾을 수 없음.");
                // 서버 응답에서 토큰을 못 찾으면 여기서 에러를 던져서 로그아웃 처리하도록 유도
                throw new Error("AuthError: NEW_ACCESS_TOKEN_NOT_FOUND");
            }

            return;
        } catch (error: any) {
            console.error("❌ [UserAuthRepository] Access Token 갱신 실패:", error.message, error.response?.status, error.response?.data);
            throw error;
        }
    },
};