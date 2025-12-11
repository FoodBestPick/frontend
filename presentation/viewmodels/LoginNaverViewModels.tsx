import { useState } from "react";
import { LoginNaver } from "../../domain/usecases/LoginNaver";
import NaverLogin, { NaverLoginResponse } from "@react-native-seoul/naver-login";
import { NAVER_CLIENT_ID, NAVER_CLIENT_SECRET, NAVER_APP_NAME } from "@env";

export const useLoginNaverViewModels = () => {
    const [loading, setLoading] = useState(false);

    const loginNaverUseCase = new LoginNaver();

    const login = async () => {
        try {
            setLoading(true);


            NaverLogin.initialize({
                appName: NAVER_APP_NAME,
                consumerKey: NAVER_CLIENT_ID,
                consumerSecret: NAVER_CLIENT_SECRET,
                serviceUrlSchemeIOS: "naverlogin" 
            });

            const result: NaverLoginResponse = await NaverLogin.login();

            if (!result.isSuccess || !result.successResponse) {
                throw new Error("NAVER_LOGIN_FAILED");
            }

            const accessToken = result.successResponse.accessToken;

            return await loginNaverUseCase.execute(accessToken);

        } finally {
            setLoading(false);
        }
    };

    return { login, loading };
};
