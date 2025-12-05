// presentation/viewmodels/useResetPasswordViewModel.tsx
import { useState } from "react";
import { ResetPasswordUseCase } from "../../domain/usecases/ResetPasswordUseCase";
import { UserAuthRepositoryImpl } from "../../data/repositoriesImpl/UserAuthRepositoryImpl";

export const useResetPasswordViewModel = () => {
    const [loading, setLoading] = useState(false);
    const usecase = new ResetPasswordUseCase(UserAuthRepositoryImpl);

    const resetPassword = async (payload: {
        email: string;
        password: string;
        passwordConfirm: string;
        code: string;
    }): Promise<boolean> => {
        setLoading(true);
        try {
            await usecase.execute(payload);
            return true;
        } catch (e) {
            console.log("[ResetPassword error]", e);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { resetPassword, loading };
};
