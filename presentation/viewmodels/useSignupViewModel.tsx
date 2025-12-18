import { useState } from "react";
// API 함수 직접 사용 (RepositoryImpl에 signup 정의됨)
import { UserAuthRepositoryImpl } from "../../data/repositoriesImpl/UserAuthRepositoryImpl";
import { useAlert } from "../../context/AlertContext";

interface SignupData {
    email: string;
    password: string;
    passwordConfirm: string;
    nickname: string;
}

export const useSignupViewModel = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showAlert } = useAlert();

    const signup = async (data: SignupData): Promise<boolean> => {
        setLoading(true);
        setError(null);

        try {
            // 회원가입 요청
            await UserAuthRepositoryImpl.signup({
                email: data.email,
                password: data.password,
                passwordConfirm: data.passwordConfirm,
                nickname: data.nickname,
            });
            return true;

        } catch (err: any) {
            console.error("회원가입 에러:", err.response?.data);

            // ⭐ [핵심] 서버 에러 메시지 추출
            // 백엔드가 { code: 409, message: "이미 가입된 이메일입니다." } 라고 보내면
            // 그 메시지를 그대로 사용자에게 보여줍니다.
            const serverMessage = err.response?.data?.message;
            const fallbackMessage = "회원가입 도중 문제가 발생했습니다.";

            const finalMessage = serverMessage || fallbackMessage;

            // 상태로 저장 (화면에서 붉은 글씨로 보여줄 수도 있음)
            setError(finalMessage);

            // 팝업으로도 즉시 알림
            showAlert({
                title: "회원가입 실패",
                message: finalMessage
            });

            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        signup,
        loading,
        error,
    };
};