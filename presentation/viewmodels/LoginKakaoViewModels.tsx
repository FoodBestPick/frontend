import { LoginWithKakaoUseCase } from "../../domain/usecases/LoginKakao";
import { AuthRepository } from "../../domain/repositories/AuthRepository";

type ContextLoginFn = (
  accessToken?: string | null,
  isAutoLogin?: boolean,
  isAdmin?: boolean,
  userId?: number
) => Promise<void>;

const normalize = (raw: any) => {
  const data = raw?.data ?? raw;
  const body = data?.result ?? data;

  return {
    accessToken: body?.accessToken ?? body?.access_token ?? null,
    isAdmin: body?.isAdmin ?? body?.admin ?? false,
    userId: body?.userId ?? body?.user_id,
  };
};

export class LoginKakaoViewModels {
  private kakaoUseCase = new LoginWithKakaoUseCase();
  private authRepo = new AuthRepository();

  private static contextLogin: ContextLoginFn | null = null;

  static bindContextLogin(fn: ContextLoginFn) {
    LoginKakaoViewModels.contextLogin = fn;
  }

  async loginWithKakao() {
    try {
      const kakaoToken = await this.kakaoUseCase.execute();
      const result = await this.authRepo.kakaoLogin(kakaoToken.accessToken);

      const { accessToken, isAdmin, userId } = normalize(result);

      if (LoginKakaoViewModels.contextLogin) {
        await LoginKakaoViewModels.contextLogin(accessToken, false, isAdmin, userId);
      } else {
        console.warn("[KakaoLogin] contextLogin is not bound. (Google/Naver VM hook가 호출되는지 확인)");
      }

      return result;
    } catch (e) {
      console.log("카카오 로그인 실패:", e);
      throw e;
    }
  }
}
