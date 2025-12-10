// src/viewmodels/useSigninViewModel.tsx (최종 버전)

import { useState } from "react";
import { Alert } from "react-native";
import { SigninUseCase } from "../../domain/usecases/SigninUseCase";
import { UserAuthRepositoryImpl } from "../../data/repositoriesImpl/UserAuthRepositoryImpl";
import { useAuth } from "../../context/AuthContext";

interface ExecuteResult {
    accessToken?: string;
    isAdmin?: boolean;
    userId?: number; // ✨ 추가: userId
}

type SigninFunction = (email: string, password: string, saveToStorage: boolean) => Promise<boolean>;

export const useSigninViewModel = () => {
    const [loading, setLoading] = useState(false);

    const useCase = new SigninUseCase(UserAuthRepositoryImpl);
    const { login: contextLogin } = useAuth();

    const signin: SigninFunction = async (email, password, saveToStorage) => {
        setLoading(true);

        try {
            const result = (await useCase.execute({ email, password })) as ExecuteResult;

            // 토큰 존재 확인 (accessToken만 확인)
            if (result.accessToken) {

                // ⭐ Context Login 호출 (refreshToken 제거됨)
                await contextLogin(
                    result.accessToken,
                    saveToStorage,       
                    result.isAdmin || false,
                    result.userId! // ✨ userId 전달 (SigninUseCase에서 userId를 반환한다고 가정)
                );
                return true;

            } else {
                Alert.alert("로그인 실패", "서버로부터 유효한 인증 정보를 받지 못했습니다. (토큰 누락)");
                return false;
            }

        } catch (error: any) {
            console.log("[로그인 실패]", JSON.stringify(error.response?.data || error.message));

            const serverMessage = error.response?.data?.message;
            const fallbackMessage = "이메일 또는 비밀번호를 확인해주세요.";

            Alert.alert("로그인 실패", serverMessage || fallbackMessage);
            return false;

        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        signin
    };
};