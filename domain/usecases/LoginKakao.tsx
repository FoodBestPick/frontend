import { login } from "@react-native-seoul/kakao-login";

export class LoginWithKakaoUseCase {
    async execute() {
        const token = await login();
        return token; 
    }
}