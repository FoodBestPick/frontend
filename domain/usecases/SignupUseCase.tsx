// domain/usecase/CheckNicknameUseCase.ts
import { checkNickname } from "../../data/api/UserAuthApi";

export class CheckNicknameUseCase {
    /**
     * 닉네임 중복 확인 실행
     * @param nickname 검사할 닉네임
     * @returns true: 사용 가능, false: 중복
     */
    async execute(nickname: string): Promise<boolean> {
        return await checkNickname(nickname);
    }
}