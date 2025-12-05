import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
    isLoggedIn: boolean;
    isAdmin: boolean;
    token: string | null;
    login: (token: string, isAdmin: boolean, saveToStorage?: boolean) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({ children }: any) => {
    const [token, setToken] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // 앱 시작 시 저장된 정보 불러오기
    useEffect(() => {
        const loadAuthData = async () => {
            try {
                const storedToken = await AsyncStorage.getItem("accessToken");
                const storedIsAdmin = await AsyncStorage.getItem("isAdmin");

                if (storedToken) {
                    setToken(storedToken);
                    // "true" 문자열일 때만 true, 그 외엔 false
                    setIsAdmin(storedIsAdmin === "true");
                }
            } catch (e) {
                console.error("Auth loading error", e);
            } finally {
                setLoading(false);
            }
        };
        loadAuthData();
    }, []);

    // 로그인 함수
    const login = async (token: string, isAdmin: boolean, saveToStorage: boolean = true) => {
        // 1. 메모리 상태 우선 업데이트 (화면 전환 속도 향상)
        setToken(token);
        setIsAdmin(isAdmin);

        // 2. 스토리지 처리
        if (saveToStorage) {
            await AsyncStorage.setItem("accessToken", token);
            await AsyncStorage.setItem("isAdmin", isAdmin ? "true" : "false");
        } else {
            // ⭐ [중요] 자동로그인 아니면 좀비 데이터 삭제!
            await AsyncStorage.removeItem("accessToken");
            await AsyncStorage.removeItem("isAdmin");
        }
    };

    // 로그아웃 함수
    const logout = async () => {
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("isAdmin");
        setToken(null);
        setIsAdmin(false);
    };

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: !!token,
                isAdmin,
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
    if (!ctx) throw new Error("AuthProvider Error");
    return ctx;
};