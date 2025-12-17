import { useEffect, useState } from "react";
import { LoginNaver } from "../../domain/usecases/LoginNaver";
import NaverLogin, { NaverLoginResponse } from "@react-native-seoul/naver-login";
import { NAVER_CLIENT_ID, NAVER_CLIENT_SECRET, NAVER_APP_NAME } from "@env";
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

export const useLoginNaverViewModels = () => {
  const [loading, setLoading] = useState(false);

  const loginNaverUseCase = new LoginNaver();
  const { login: contextLogin } = useAuth();

  useEffect(() => {
    LoginKakaoViewModels.bindContextLogin(contextLogin);
  }, [contextLogin]);

  const login = async () => {
    try {
      setLoading(true);

      NaverLogin.initialize({
        appName: NAVER_APP_NAME,
        consumerKey: NAVER_CLIENT_ID,
        consumerSecret: NAVER_CLIENT_SECRET,
        serviceUrlSchemeIOS: "naverlogin",
      });

      const result: NaverLoginResponse = await NaverLogin.login();

      if (!result.isSuccess || !result.successResponse) {
        throw new Error("NAVER_LOGIN_FAILED");
      }

      const accessToken = result.successResponse.accessToken;
      const response: SocialAuthResult = await loginNaverUseCase.execute(accessToken);

      const { accessToken: appToken, isAdmin, userId } = normalize(response);
      await contextLogin(appToken, false, isAdmin, userId);

      return response;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
};
