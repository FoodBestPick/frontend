import { UserAuthRepository } from "../repositories/UserAuthRepository";

export class ChangePasswordUseCase {
    constructor(private repo: UserAuthRepository) { }

    async execute(payload: {
        newPassword: string;
        confirmNewPassword: string; // 추가
    }): Promise<void> {
        return this.repo.changePassword(payload);
    }
}