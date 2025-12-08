import { UserAuthRepository } from "../repositories/UserAuthRepository";

export class DeleteAccountUseCase {
    constructor(private repo: UserAuthRepository) { }

    async execute(password: string, passwordConfirm: string): Promise<void> {
        return this.repo.deleteAccount(password, passwordConfirm);
    }
}