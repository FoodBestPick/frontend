import { useState } from "react";
import { Alert } from "react-native";
import { SigninUseCase } from "../../domain/usecases/SigninUseCase";
import { UserAuthRepositoryImpl } from "../../data/repositoriesImpl/UserAuthRepositoryImpl";
import { useAuth } from "../../context/AuthContext";

export const useSigninViewModel = () => {
    const [loading, setLoading] = useState(false);

    const useCase = new SigninUseCase(UserAuthRepositoryImpl);
    const { login: contextLogin } = useAuth();

    const signin = async (email: string, password: string, saveToStorage: boolean): Promise<boolean> => {
        setLoading(true);

        try {
            const result = await useCase.execute({ email, password });

            // ⭐ [수정] refreshToken 전달 삭제 (Context와 맞춤)
            await contextLogin(
                result.accessToken,
                result.isAdmin,
                saveToStorage
            );
            return true;

        } catch (error: any) {
            console.log("[로그인 실패]", error.response?.data);

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