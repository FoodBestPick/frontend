import { useState } from "react";
import { Alert } from "react-native";
import { DeleteAccountUseCase } from "../../domain/usecases/DeleteAccountUseCase";
import { UserAuthRepositoryImpl } from "../../data/repositoriesImpl/UserAuthRepositoryImpl";
import { useAuth } from "../../context/AuthContext";

export const useDeleteAccountViewModel = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { logout } = useAuth(); // 탈퇴 성공 후 로그아웃 처리를 위해 가져옴

    const usecase = new DeleteAccountUseCase(UserAuthRepositoryImpl);

    const deleteAccount = async (password: string, passwordConfirm: string): Promise<boolean> => {
        // 1. 유효성 검사
        if (!password || !passwordConfirm) {
            Alert.alert("알림", "비밀번호를 입력해주세요.");
            return false;
        }

        if (password !== passwordConfirm) {
            Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
            return false;
        }

        // 2. 탈퇴 요청
        setIsLoading(true);
        try {
            await usecase.execute(password, passwordConfirm);

            // 3. 성공 처리
            Alert.alert("탈퇴 완료", "회원 탈퇴가 정상적으로 처리되었습니다.", [
                {
                    text: "확인",
                    onPress: async () => {
                        await logout(); // 로그아웃 시켜서 로그인 화면으로 보냄
                    }
                }
            ]);
            return true;

        } catch (error: any) {
            console.error("[DeleteAccount Error]", error);
            const errorMsg = error.response?.data?.message || "회원 탈퇴에 실패했습니다. 비밀번호를 확인해주세요.";
            Alert.alert("탈퇴 실패", errorMsg);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        deleteAccount,
        isLoading
    };
};