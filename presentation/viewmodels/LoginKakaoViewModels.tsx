import { LoginWithKakaoUseCase } from "../../domain/usecases/LoginKakao";
import { AuthRepository } from "../../domain/repositories/AuthRepository";

export class LoginKakaoViewModels {

    private kakaoUseCase = new LoginWithKakaoUseCase();
    private authRepo = new AuthRepository();

    async loginWithKakao() {
        try {
            const kakaoToken = await this.kakaoUseCase.execute();
            const result = await this.authRepo.kakaoLogin(kakaoToken.accessToken);
            return result;
        } catch (e) {
            console.log("카카오 로그인 실패:", e);
            throw e;
        }
    }
}