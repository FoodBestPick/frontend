export interface UserAuthRepository {
    // ⭐ [추가됨] 닉네임 중복 확인
    checkNickname(nickname: string): Promise<boolean>;

    // 회원가입용 이메일 인증코드 전송
    sendSignupEmail(email: string): Promise<void>;

    // 비밀번호 재설정용 이메일 인증코드 전송
    sendPasswordResetEmail(email: string): Promise<void>;

    // 공통 이메일 인증코드 검증
    verifyEmail(email: string, code: string): Promise<void>;

    // 최종 회원가입
    signup(payload: {
        email: string;
        password: string;
        passwordConfirm: string;
        nickname: string;
    }): Promise<void>;

    // 로그인
    signin(payload: {
        email: string;
        password: string;
    }): Promise<{
        accessToken: string;
        refreshToken?: string;
    }>;

    // 비밀번호 초기화 (계정찾기 마지막 단계)
    resetPassword(payload: {
        email: string;
        password: string;
        passwordConfirm: string;
        code: string;
    }): Promise<void>;
}