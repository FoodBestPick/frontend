// domain/usecases/SendSignupEmailUseCase.tsx
import { UserAuthRepository } from "../repositories/UserAuthRepository";

export class SendSignupEmailUseCase {
    constructor(private repo: UserAuthRepository) { }

    async execute(email: string): Promise<void> {
        return this.repo.sendSignupEmail(email);
    }
}
