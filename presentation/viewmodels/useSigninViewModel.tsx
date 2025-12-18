// src/viewmodels/useSigninViewModel.tsx (최종 버전)

import { useState } from "react";
import { SigninUseCase } from "../../domain/usecases/SigninUseCase";
import { UserAuthRepositoryImpl } from "../../data/repositoriesImpl/UserAuthRepositoryImpl";
import { useAuth } from "../../context/AuthContext";
import { useAlert } from "../../context/AlertContext";

interface ExecuteResult {
    accessToken?: string; // 추가
    refreshToken?: string; // 추가
    isAdmin?: boolean;
    userId?: number; 
}

type SigninFunction = (email: string, password: string, saveToStorage: boolean) => Promise<boolean>;

export const useSigninViewModel = () => {
    const [loading, setLoading] = useState(false);

    const useCase = new SigninUseCase(UserAuthRepositoryImpl);
    const { login: contextLogin } = useAuth();
    const { showAlert } = useAlert();

    const signin: SigninFunction = async (email, password, saveToStorage) => {
        setLoading(true);

        try {
            const result = (await useCase.execute({ email, password })) as ExecuteResult;

            // userId가 있으면 로그인 성공으로 간주
            if (result.userId !== undefined) {

                // ⭐ Context Login 호출
                // login(accessTokenArg?, isAutoLogin?, isAdmin?, userId?)
                await contextLogin(
                    result.accessToken || null, // 수정: 토큰 직접 전달
                    saveToStorage,       
                    result.isAdmin || false,
                    result.userId! 
                );
                return true;

            } else {
                showAlert({
                    title: "로그인 실패",
                    message: "서버로부터 유효한 사용자 정보를 받지 못했습니다."
                });
                return false;
            }

        } catch (error: any) {
            console.log("[로그인 실패]", JSON.stringify(error.response?.data || error.message));

            const serverMessage = error.response?.data?.message;
            const fallbackMessage = "이메일 또는 비밀번호를 확인해주세요.";

            showAlert({
                title: "로그인 실패",
                message: serverMessage || fallbackMessage
            });
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