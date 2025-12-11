import { useState } from "react";
import { Alert } from "react-native";
import { ChangePasswordUseCase } from "../../domain/usecases/ChangePasswordUseCase";
import { UserAuthRepositoryImpl } from "../../data/repositoriesImpl/UserAuthRepositoryImpl";

export const useChangePasswordViewModel = () => {
    const [isLoading, setIsLoading] = useState(false);

    // Repository 주입
    const usecase = new ChangePasswordUseCase(UserAuthRepositoryImpl);

    // ✅ 정규식: 영문, 숫자 필수 포함 & 전체 길이 10자 이상 (특수문자는 있어도 되고 없어도 됨)
    const validatePassword = (password: string) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d).{10,}$/;
        return regex.test(password);
    };

    const changePassword = async (
        newPassword: string,
        confirmPassword: string
    ): Promise<boolean> => {
        // 1. 빈 값 검사
        if (!newPassword || !confirmPassword) {
            Alert.alert('알림', '모든 항목을 입력해주세요.');
            return false;
        }

        // 2. 정규식 검사
        if (!validatePassword(newPassword)) {
            Alert.alert(
                '비밀번호 규칙 미준수',
                '비밀번호는 영문과 숫자를 반드시 포함하여 10자 이상이어야 합니다.'
            );
            return false;
        }

        // 3. 일치 검사
        if (newPassword !== confirmPassword) {
            Alert.alert('오류', '새 비밀번호가 서로 일치하지 않습니다.');
            return false;
        }

        setIsLoading(true);
        try {
            await usecase.execute({
                newPassword,
                confirmNewPassword: confirmPassword,
            });
            return true; // 성공
        } catch (error: any) {
            console.error("[ChangePassword error]", error);
            const errorMsg = error.response?.data?.message || '비밀번호 변경에 실패했습니다.';
            Alert.alert('오류', errorMsg);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        changePassword,
        isLoading,
        validatePassword
    };
};