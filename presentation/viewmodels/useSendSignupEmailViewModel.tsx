// presentation/viewmodels/useSendSignupEmailViewModel.tsx
import { useState } from "react";
import { SendSignupEmailUseCase } from "../../domain/usecases/SendSignupEmailUseCase";
import { UserAuthRepositoryImpl } from "../../data/repositoriesImpl/UserAuthRepositoryImpl";

export const useSendSignupEmailViewModel = () => {
    const [loading, setLoading] = useState(false);
    const usecase = new SendSignupEmailUseCase(UserAuthRepositoryImpl);

    const sendEmail = async (email: string): Promise<boolean> => {
        setLoading(true);
        try {
            await usecase.execute(email);
            return true;
        } catch (e) {
            console.log("[SendSignupEmail error]", e);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { sendEmail, loading };
};
