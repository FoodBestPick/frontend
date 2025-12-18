import { useEffect, useState } from "react";
import { LoginGoogle } from "../../domain/usecases/LoginGoogle";
import { useAuth } from "../../context/AuthContext";
import { LoginKakaoViewModels } from "./LoginKakaoViewModels";

type SocialAuthResult = {
  accessToken?: string;
  isAdmin?: boolean;
  userId?: number;
  data?: any;
  result?: any;
};

const normalize = (raw: any) => {
  const data = raw?.data ?? raw;
  const body = data?.result ?? data;

  return {
    accessToken: body?.accessToken ?? body?.access_token ?? null,
    isAdmin: body?.isAdmin ?? body?.admin ?? false,
    userId: body?.userId ?? body?.user_id,
  };
};

export const useLoginGoogleViewModel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login: contextLogin } = useAuth();

  useEffect(() => {
    LoginKakaoViewModels.bindContextLogin(contextLogin);
  }, [contextLogin]);

  const loginGoogle = async (idToken: string) => {
    try {
      setLoading(true);
      setError(null);

      const loginGoogleUseCase = new LoginGoogle();
      const response: SocialAuthResult = await loginGoogleUseCase.execute(idToken);

      const { accessToken, isAdmin, userId } = normalize(response);

      await contextLogin(accessToken, false, isAdmin, userId);

      return response;
    } catch (e: any) {
      console.log("Google login error:", e);
      setError(e?.response?.data?.message || "구글 로그인 실패");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, loginGoogle };
};
