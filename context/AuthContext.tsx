// src/context/AuthContext.tsx (최종 버전)

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserAuthRepositoryImpl } from '../data/repositoriesImpl/UserAuthRepositoryImpl'; // Import Repository

interface AuthContextType {
    isLoggedIn: boolean;
    token: string | null;
    loading: boolean;
    isAdmin: boolean;
    login: (accessToken: string, isAutoLogin: boolean, isAdmin: boolean) => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    token: null,
    loading: true,
    isAdmin: false,
    login: async () => { },
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // 🚀 앱 시작 시 토큰 및 isAdmin 로드 로직
    const loadToken = async () => {
        try {
            setLoading(true);
            const storedAccessToken = await AsyncStorage.getItem('accessToken');
            const storedIsAutoLogin = await AsyncStorage.getItem('isAutoLogin');
            const storedIsAdmin = await AsyncStorage.getItem('isAdmin');

            if (storedAccessToken && storedIsAutoLogin === 'true') {
                setToken(storedAccessToken);
                setIsLoggedIn(true);
                setIsAdmin(storedIsAdmin === 'true');
            } else if (storedAccessToken && storedIsAutoLogin !== 'true') {
                // 자동 로그인 선택 해제 시 토큰 삭제 (isAdmin 포함)
                await AsyncStorage.multiRemove(['accessToken', 'isAutoLogin', 'isAdmin']);
                setToken(null);
                setIsLoggedIn(false);
                setIsAdmin(false);
            }

        } catch (e) {
            console.error('Failed to load token', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadToken();
    }, []);

    // ✅ 로그인 함수 (저장소에 토큰 저장 - RefreshToken은 HttpOnly Cookie로 관리됨)
    const login = async (accessToken: string, isAutoLogin: boolean, isAdmin: boolean) => {
        try {
            await AsyncStorage.setItem('accessToken', accessToken);
            // refreshToken 저장 로직 제거됨 (HttpOnly Cookie 사용)

            await AsyncStorage.setItem('isAutoLogin', isAutoLogin ? 'true' : 'false');
            await AsyncStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');

            setToken(accessToken);
            setIsLoggedIn(true);
            setIsAdmin(isAdmin);
        } catch (e) {
            console.error(e);
        }
    };

    // ✅ 로그아웃 함수 (Refactored to use Repository)
    const logout = async () => {
        try {
            // Call the repository's logout method which handles API call + storage clearing
            await UserAuthRepositoryImpl.logout(); 
        } catch (e) {
            console.error("Logout failed:", e);
            // Fallback: Clear storage locally if repo fails (though repo handles this too)
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'isAutoLogin', 'isAdmin']);
        } finally {
            // Update Context State
            setToken(null);
            setIsLoggedIn(false);
            setIsAdmin(false);
        }
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, token, loading, isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};