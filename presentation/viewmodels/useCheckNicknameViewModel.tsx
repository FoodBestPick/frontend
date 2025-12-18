import { useState } from "react";
import { useAlert } from "../../context/AlertContext";

// ⭐ [1] UseCase와 Repository 구현체를 가져옵니다.
// (경로가 ../../domain/... 이게 맞는지 파일 트리를 꼭 확인하세요!)
import { CheckNicknameUseCase } from "../../domain/usecases/CheckNicknameUseCase";
import { UserAuthRepositoryImpl } from "../../data/repositoriesImpl/UserAuthRepositoryImpl";

export const useCheckNicknameViewModel = () => {
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { showAlert } = useAlert();

    // ⭐ [2] 안전한 인스턴스 생성
    // 화면이 렌더링될 때 UseCase가 없으면 에러가 나므로, 함수 내부가 아닌 여기서 생성하되
    // 혹시라도 Import 에러가 났을 때를 대비해 방어 코드를 넣는 것이 좋지만,
    // 지금은 확실한 Import를 믿고 생성합니다.

    // UserAuthRepositoryImpl은 '객체'이므로 바로 주입 가능합니다.
    const useCase = new CheckNicknameUseCase(UserAuthRepositoryImpl);

    const check = async (nickname: string) => {
        if (!nickname || nickname.trim().length < 2) {
            showAlert({ title: "알림", message: "닉네임은 2글자 이상 입력해주세요." });
            return;
        }

        setIsLoading(true);
        setIsAvailable(null);

        try {
            const result = await useCase.execute(nickname);
            setIsAvailable(result);
        } catch (error) {
            console.error(error);
            showAlert({ title: "오류", message: "중복 확인 중 문제가 발생했습니다." });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isAvailable,
        isLoading,
        check,
        setIsAvailable,
    };
};