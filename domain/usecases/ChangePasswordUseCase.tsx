import { UserAuthRepository } from "../repositories/UserAuthRepository";

export class ChangePasswordUseCase {
    constructor(private repo: UserAuthRepository) { }

    async execute(payload: {
        currentPassword: string;
        newPassword: string;
    }): Promise<void> {
        return this.repo.changePassword(payload);
    }
}