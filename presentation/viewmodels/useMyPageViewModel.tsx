import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { UserProfileUseCase } from "../../domain/usecases/UserProfileUseCase";
import { UserAuthRepositoryImpl } from "../../data/repositoriesImpl/UserAuthRepositoryImpl";
import { useAuth } from "../../context/AuthContext";

export const useMyPageViewModel = () => {
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<{
        email: string;
        nickname: string;
        image: string | null;
        stateMessage: string;
    } | null>(null);

    const useCase = new UserProfileUseCase(UserAuthRepositoryImpl);
    const { logout } = useAuth();

    // 1. 프로필 로딩
    const loadProfile = async () => {
        setLoading(true);
        try {
            const data = await useCase.getMyProfile();
            setProfile({
                email: data.email,
                nickname: data.nickname,
                image: data.profileImage,
                stateMessage: data.stateMessage || "",
            });
        } catch (e) {
            console.error("프로필 로드 실패", e);
        } finally {
            setLoading(false);
        }
    };

    // 2. ⭐ [핵심 수정] 프로필 수정 (에러 메시지 상세 출력)
    const saveProfile = async (nickname: string, stateMessage: string, imageFile?: any) => {
        setLoading(true);
        try {
            console.log("🟡 [ViewModel] 저장 시도...");

            await useCase.updateProfile(nickname, stateMessage, imageFile);

            Alert.alert("성공", "프로필이 수정되었습니다.");
            loadProfile();
            return true;

        } catch (e: any) {
            console.log("🔴 [ViewModel] 저장 실패:", e);

            // 1순위: 백엔드가 보낸 에러 메시지 (예: "파일 크기 초과", "필수값 누락")
            // 2순위: Axios 에러 메시지 (예: "Network Error")
            // 3순위: 기본 메시지
            const serverMsg = e.response?.data?.message;
            const errorMsg = serverMsg || e.message || "알 수 없는 오류로 수정에 실패했습니다.";

            Alert.alert("수정 실패", errorMsg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // 3. 회원 탈퇴
    const deleteAccount = async (pw: string, confirm: string) => {
        setLoading(true);
        try {
            await useCase.deleteAccount(pw, confirm);
            Alert.alert("탈퇴 완료", "계정이 삭제되었습니다.");
            await logout();
            return true;
        } catch (e: any) {
            const msg = e.response?.data?.message || "탈퇴 실패";
            Alert.alert("오류", msg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    return {
        loading,
        profile,
        loadProfile,
        saveProfile,
        deleteAccount,
    };
};