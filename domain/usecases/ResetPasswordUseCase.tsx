// domain/usecases/ResetPasswordUseCase.tsx
import { UserAuthRepository } from "../repositories/UserAuthRepository";

export class ResetPasswordUseCase {
    constructor(private repo: UserAuthRepository) { }

    async execute(payload: {
        email: string;
        password: string;
        passwordConfirm: string;
        code: string;
    }): Promise<void> {
        return this.repo.resetPassword(payload);
    }
}
