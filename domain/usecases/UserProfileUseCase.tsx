import { UserAuthRepository } from "../repositories/UserAuthRepository";

export class UserProfileUseCase {
    constructor(private repo: UserAuthRepository) { }

    // 1. 내 프로필 조회
    async getMyProfile() {
        return await this.repo.getMyProfile();
    }

    // 2. 내 프로필 수정
    async updateProfile(nickname: string, stateMessage: string, file?: any) {
        return await this.repo.updateProfile({ nickname, stateMessage, file });
    }

    // 3. FCM 토큰 등록
    async registerFcm(token: string) {
        return await this.repo.registerFcmToken(token);
    }

    // 4. 회원 탈퇴
    async deleteAccount(pw: string, confirm: string) {
        return await this.repo.deleteAccount(pw, confirm);
    }

    // 5. 타인 프로필 조회
    async getUserProfile(userId: number) {
        return await this.repo.getUserProfile(userId);
    }
}