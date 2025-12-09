import { UserAuthRepository } from "../repositories/UserAuthRepository";

export class SignupUseCase {
    constructor(private userAuthRepository: UserAuthRepository) { }

    async execute(payload: {
        email: string;
        password: string;
        passwordConfirm: string;
        nickname: string;
    }): Promise<void> {
        return this.userAuthRepository.signup(payload);
    }
}