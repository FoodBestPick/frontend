import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
    isLoggedIn: boolean;
    token: string | null;
    // ⭐ [수정] saveToStorage 옵션 추가 (기본값 true)
    login: (token: string, saveToStorage?: boolean) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({ children }: any) => {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // 앱 시작 시 토큰 로딩
    useEffect(() => {
        const loadToken = async () => {
            try {
                const stored = await AsyncStorage.getItem("accessToken");
                if (stored) {
                    setToken(stored);
                }
            } catch (e) {
                console.error("Failed to load token", e);
            } finally {
                setLoading(false);
            }
        };
        loadToken();
    }, []);

    // ⭐ [수정] 자동 로그인 체크 여부에 따라 스토리지 저장 분기 처리
    const login = async (token: string, saveToStorage: boolean = true) => {
        if (saveToStorage) {
            await AsyncStorage.setItem("accessToken", token);
        }
        // 메모리 상의 토큰은 무조건 업데이트 (그래야 App.tsx가 화면을 전환함)
        setToken(token);
    };

    const logout = async () => {
        await AsyncStorage.removeItem("accessToken");
        setToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: !!token,
                token,
                login,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("AuthProvider 안에서 사용해야 합니다.");
    return ctx;
};