export interface UserAuthRepository {
    // 닉네임 중복 확인
    checkNickname(nickname: string): Promise<boolean>;

    // 이메일 전송/검증
    sendSignupEmail(email: string): Promise<void>;
    sendPasswordResetEmail(email: string): Promise<void>;
    verifyEmail(email: string, code: string): Promise<void>;

    // 회원가입
    signup(payload: {
        email: string;
        password: string;
        passwordConfirm: string;
        nickname: string;
    }): Promise<void>;

    // ⭐ 로그인 (isAdmin 추가)
    signin(payload: {
        email: string;
        password: string;
    }): Promise<{
        accessToken: string;
        refreshToken?: string;
        isAdmin: boolean;
    }>;

    // 비밀번호 초기화
    resetPassword(payload: {
        email: string;
        password: string;
        passwordConfirm: string;
        code: string;
    }): Promise<void>;
}