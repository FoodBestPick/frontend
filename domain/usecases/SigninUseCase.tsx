import { UserAuthRepository } from "../repositories/UserAuthRepository";

export class SigninUseCase {
    constructor(private repo: UserAuthRepository) { }

    async execute(payload: {
        email: string;
        password: string;
    }): Promise<{
        accessToken: string;
        refreshToken?: string;
        isAdmin: boolean; // ⭐
    }> {
        return this.repo.signin(payload);
    }
}