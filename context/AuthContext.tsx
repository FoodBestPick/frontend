// src/context/AuthContext.tsx (최종 버전)

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserAuthRepositoryImpl } from '../data/repositoriesImpl/UserAuthRepositoryImpl'; // Import Repository

interface AuthContextType {
    isLoggedIn: boolean;
    token: string | null;
    loading: boolean;
    isAdmin: boolean;
    currentUserId: number | null; // ✨ 추가: 현재 로그인한 사용자의 ID
    login: (accessToken: string, isAutoLogin: boolean, isAdmin: boolean, userId: number) => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    token: null,
    loading: true,
    isAdmin: false,
    currentUserId: null, // ✨ 추가: currentUserId 기본값
    login: async () => { },
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null); // ✨ 추가: 현재 사용자 ID 상태

    // 🚀 앱 시작 시 토큰 및 isAdmin 로드 로직
    const loadToken = async () => {
        try {
            setLoading(true);
            const storedAccessToken = await AsyncStorage.getItem('accessToken');
            const storedIsAutoLogin = await AsyncStorage.getItem('isAutoLogin');
            const storedIsAdmin = await AsyncStorage.getItem('isAdmin');
            const storedUserId = await AsyncStorage.getItem('userId'); // ✨ 추가: userId 로드

            if (storedAccessToken && storedIsAutoLogin === 'true') {
                setToken(storedAccessToken);
                setIsLoggedIn(true);
                setIsAdmin(storedIsAdmin === 'true');
                setCurrentUserId(storedUserId ? parseInt(storedUserId) : null); // ✨ 추가: userId 설정
            } else if (storedAccessToken && storedIsAutoLogin !== 'true') {
                // 자동 로그인 선택 해제 시 토큰 삭제 (isAdmin 포함)
                await AsyncStorage.multiRemove(['accessToken', 'isAutoLogin', 'isAdmin', 'userId']); // ✨ 추가: userId 삭제
                setToken(null);
                setIsLoggedIn(false);
                setIsAdmin(false);
                setCurrentUserId(null); // ✨ 추가: userId 초기화
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
    const login = async (accessToken: string, isAutoLogin: boolean, isAdmin: boolean, userId: number) => { // ✨ userId 추가
        try {
            await AsyncStorage.setItem('accessToken', accessToken);
            await AsyncStorage.setItem('isAutoLogin', isAutoLogin ? 'true' : 'false');
            await AsyncStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
            await AsyncStorage.setItem('userId', userId.toString()); // ✨ userId 저장

            setToken(accessToken);
            // 🚨 순서 변경: 권한 및 유저 정보를 먼저 세팅
            setIsAdmin(isAdmin);
            setCurrentUserId(userId); 
            
            // 마지막에 로그인 상태를 true로 변경하여 네비게이션이 올바른 상태를 참조하도록 함
            setIsLoggedIn(true);
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
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'isAutoLogin', 'isAdmin', 'userId']); // ✨ userId 삭제
        } finally {
            // Update Context State
            setToken(null);
            setIsLoggedIn(false);
            setIsAdmin(false);
            setCurrentUserId(null); // ✨ userId 초기화
        }
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, token, loading, isAdmin, currentUserId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};