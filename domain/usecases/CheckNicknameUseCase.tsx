import { UserAuthRepository } from "../repositories/UserAuthRepository";

// ⭐ 'export class'로 확실하게 내보냅니다.
export class CheckNicknameUseCase {
    constructor(private repo: UserAuthRepository) { }

    async execute(nickname: string): Promise<boolean> {
        return await this.repo.checkNickname(nickname);
    }
}