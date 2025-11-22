import { AuthRepository } from "../repositories/AuthRepository"

export class LoginGoogle {
    private authRepository = new AuthRepository();
    
    async execute(idToken: string) {
        return await this.authRepository.googleLogin(idToken);
    }
}