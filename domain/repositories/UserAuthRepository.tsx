export interface UserAuthRepository {
    // --- [기존 Auth 기능] ---
    checkNickname(nickname: string): Promise<boolean>;
    sendSignupEmail(email: string): Promise<void>;
    sendPasswordResetEmail(email: string): Promise<void>;
    verifyEmail(email: string, code: string): Promise<void>;
    signup(payload: {
        email: string;
        password: string;
        passwordConfirm: string;
        nickname: string;
    }): Promise<void>;
    signin(payload: {
        email: string;
        password: string;
    }): Promise<{
        accessToken: string;
        refreshToken?: string;
        isAdmin: boolean;
    }>;
    resetPassword(payload: {
        email: string;
        password: string;
        passwordConfirm: string;
        code: string;
    }): Promise<void>;

    // --- [마이페이지 기능] ---

    // 1. 내 프로필 조회
    getMyProfile(): Promise<{
        email: string;
        nickname: string;
        profileImage: string | null;
        stateMessage: string | null;
    }>;

    // 2. 내 프로필 수정 (이미지 포함)
    updateProfile(data: {
        nickname: string;
        stateMessage: string;
        file?: any; // 이미지 객체
    }): Promise<void>;

    // 3. FCM 토큰 등록
    registerFcmToken(token: string): Promise<void>;

    // 4. 회원 탈퇴
    deleteAccount(password: string, passwordConfirm: string): Promise<void>;

    // 5. 타인 프로필 조회
    getUserProfile(userId: number): Promise<{
        email: string;
        nickname: string;
        profileImage: string | null;
        stateMessage: string | null;
    }>;

    // ⭐ [추가됨] 비밀번호 변경
    changePassword(payload: {
        currentPassword: string;
        newPassword: string;
    }): Promise<void>;
}