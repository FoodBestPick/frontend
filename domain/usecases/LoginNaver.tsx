import { AuthRepository } from "../repositories/AuthRepository"

export class LoginNaver {
    private authRepository = new AuthRepository();
    
    async execute(idToken: string) {
        return await this.authRepository.naverLogin(idToken);
    }
}