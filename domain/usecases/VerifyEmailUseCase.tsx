// domain/usecases/VerifyEmailUseCase.tsx
import { UserAuthRepository } from "../repositories/UserAuthRepository";

export class VerifyEmailUseCase {
    constructor(private repo: UserAuthRepository) { }

    async execute(email: string, code: string): Promise<void> {
        return this.repo.verifyEmail(email, code);
    }
}
