import { useState } from "react";
import { LoginGoogle } from "../../domain/usecases/LoginGoogle";

export const useLoginGoogleViewModel = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loginGoogle = async (idToken: string) => {
        try {
            setLoading(true);
            setError(null);
            const loginGoogleUseCase = new LoginGoogle();
            const response = await loginGoogleUseCase.execute(idToken);

            return response;
        } catch (e: any) {
            console.log("Google login error:", e);
            setError(e?.response?.data?.message || "구글 로그인 실패");
            throw e;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        loginGoogle,
    };
};
