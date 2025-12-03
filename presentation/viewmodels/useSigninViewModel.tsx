import { useState } from "react";
import { Alert } from "react-native";
import { SigninUseCase } from "../../domain/usecases/SigninUseCase";
import { UserAuthRepositoryImpl } from "../../data/repositoriesImpl/UserAuthRepositoryImpl";
import { useAuth } from "../../context/AuthContext";

export const useSigninViewModel = () => {
    const [loading, setLoading] = useState(false);

    // Repository 주입
    const useCase = new SigninUseCase(UserAuthRepositoryImpl);
    const { login: contextLogin } = useAuth();

    const signin = async (email: string, password: string, saveToStorage: boolean): Promise<boolean> => {
        setLoading(true);

        try {
            // API 호출
            const tokens = await useCase.execute({ email, password });

            // Context 업데이트 (로그인 성공 처리)
            await contextLogin(tokens.accessToken, saveToStorage);
            return true;

        } catch (error: any) {
            console.log("[로그인 실패]", error.response?.data);

            // ⭐ [핵심] 서버가 보낸 에러 메시지 우선 표시
            // (예: "비밀번호가 일치하지 않습니다.", "존재하지 않는 계정입니다.")
            const serverMessage = error.response?.data?.message;
            const fallbackMessage = "이메일 또는 비밀번호를 확인해주세요.";

            Alert.alert("로그인 실패", serverMessage || fallbackMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { signin, loading };
};