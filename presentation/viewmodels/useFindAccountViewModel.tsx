import { useState } from "react";
import { Alert } from "react-native";

// ⭐ 가지고 계신 UseCase들 import
import { SendPasswordResetEmailUseCase } from "../../domain/usecases/SendPasswordResetEmailUseCase";
import { VerifyEmailUseCase } from "../../domain/usecases/VerifyEmailUseCase";
import { ResetPasswordUseCase } from "../../domain/usecases/ResetPasswordUseCase";

// Repository 구현체
import { UserAuthRepositoryImpl } from "../../data/repositoriesImpl/UserAuthRepositoryImpl";

export const useFindAccountViewModel = () => {
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // UseCase 조립
    const sendEmailUC = new SendPasswordResetEmailUseCase(UserAuthRepositoryImpl);
    const verifyEmailUC = new VerifyEmailUseCase(UserAuthRepositoryImpl);
    const resetPasswordUC = new ResetPasswordUseCase(UserAuthRepositoryImpl);

    // 1. 인증번호 전송
    const sendCode = async (email: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await sendEmailUC.execute(email);
            setEmailSent(true);
            return true;
        } catch (e: any) {
            setError(e.response?.data?.message || "전송 실패");
            return false;
        } finally {
            setLoading(false);
        }
    };

    // 2. 인증번호 검증
    const verifyCode = async (email: string, code: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await verifyEmailUC.execute(email, code);
            setEmailVerified(true);
            return true;
        } catch (e: any) {
            setError(e.response?.data?.message || "인증번호 불일치");
            return false;
        } finally {
            setLoading(false);
        }
    };

    // 3. 비밀번호 재설정
    const resetPassword = async (email: string, code: string, password: string, passwordConfirm: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            // ⭐ UseCase에 code도 같이 넘겨야 백엔드가 처리해줍니다.
            await resetPasswordUC.execute({
                email,
                code,
                password,
                passwordConfirm,
            });
            return true;
        } catch (e: any) {
            setError(e.response?.data?.message || "재설정 실패");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        emailSent,
        emailVerified,
        error,
        sendCode,
        verifyCode,
        resetPassword,
    };
};