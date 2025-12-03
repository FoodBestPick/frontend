// domain/usecases/SendPasswordResetEmailUseCase.tsx
import { UserAuthRepository } from "../repositories/UserAuthRepository";

export class SendPasswordResetEmailUseCase {
    constructor(private repo: UserAuthRepository) { }

    async execute(email: string): Promise<void> {
        return this.repo.sendPasswordResetEmail(email);
    }
}
