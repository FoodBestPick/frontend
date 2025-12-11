// presentation/viewmodels/useVerifyEmailViewModel.tsx
import { useState } from "react";
import { VerifyEmailUseCase } from "../../domain/usecases/VerifyEmailUseCase";
import { UserAuthRepositoryImpl } from "../../data/repositoriesImpl/UserAuthRepositoryImpl";

export const useVerifyEmailViewModel = () => {
    const [loading, setLoading] = useState(false);
    const usecase = new VerifyEmailUseCase(UserAuthRepositoryImpl);

    const verify = async (email: string, code: string): Promise<boolean> => {
        setLoading(true);
        try {
            await usecase.execute(email, code);
            return true;
        } catch (e) {
            console.log("[VerifyEmail error]", e);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { verify, loading };
};
