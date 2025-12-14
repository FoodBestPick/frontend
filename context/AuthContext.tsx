// src/context/AuthContext.tsx (최종 버전)

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserAuthRepositoryImpl } from '../data/repositoriesImpl/UserAuthRepositoryImpl'; 
import { ChatRepositoryImpl } from '../data/repositoriesImpl/ChatRepositoryImpl';

interface AuthContextType {
    isLoggedIn: boolean;
    token: string | null;
    loading: boolean;
    isAdmin: boolean;
    currentUserId: number | null;
    activeRoomId: number | null; // ✨ 추가: 현재 참여 중인 방 ID
    checkActiveRoom: () => Promise<void>; // ✨ 추가: 방 상태 확인 함수
    login: (accessToken: string, isAutoLogin: boolean, isAdmin: boolean, userId: number) => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    token: null,
    loading: true,
    isAdmin: false,
    currentUserId: null,
    activeRoomId: null,
    checkActiveRoom: async () => { },
    login: async () => { },
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [activeRoomId, setActiveRoomId] = useState<number | null>(null); // ✨ 추가

    // ✨ 내 방 확인 함수
    const checkActiveRoom = async () => {
        if (!token) return;
        try {
            console.log("[AuthContext] 방 확인 시작 (Token exists)");
            const roomId = await ChatRepositoryImpl.getMyActiveRoom(token);
            console.log("[AuthContext] API 응답 Room ID:", roomId);
            setActiveRoomId(roomId);
        } catch (e) {
            console.error("[AuthContext] 방 확인 실패:", e);
        }
    };

    // 🚀 앱 시작 시 토큰 및 isAdmin 로드 로직
    const loadToken = async () => {
        try {
            setLoading(true);
            const storedAccessToken = await AsyncStorage.getItem('accessToken');
            const storedIsAutoLogin = await AsyncStorage.getItem('isAutoLogin');
            const storedIsAdmin = await AsyncStorage.getItem('isAdmin');
            const storedUserId = await AsyncStorage.getItem('userId');

            if (storedAccessToken && storedIsAutoLogin === 'true') {
                setToken(storedAccessToken);
                setIsLoggedIn(true);
                setIsAdmin(storedIsAdmin === 'true');
                setCurrentUserId(storedUserId ? parseInt(storedUserId) : null);
                
                // ✨ 저장된 토큰으로 방 확인
                const roomId = await ChatRepositoryImpl.getMyActiveRoom(storedAccessToken);
                setActiveRoomId(roomId);

            } else if (storedAccessToken && storedIsAutoLogin !== 'true') {
                await AsyncStorage.multiRemove(['accessToken', 'isAutoLogin', 'isAdmin', 'userId']);
                setToken(null);
                setIsLoggedIn(false);
                setIsAdmin(false);
                setCurrentUserId(null);
                setActiveRoomId(null);
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

    // ✅ 로그인 함수
    const login = async (accessToken: string, isAutoLogin: boolean, isAdmin: boolean, userId: number) => {
        try {
            await AsyncStorage.setItem('accessToken', accessToken);
            await AsyncStorage.setItem('isAutoLogin', isAutoLogin ? 'true' : 'false');
            await AsyncStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
            await AsyncStorage.setItem('userId', userId.toString());

            setToken(accessToken);
            setIsAdmin(isAdmin);
            setCurrentUserId(userId);
            
            // ✨ 로그인 직후 방 확인
            const roomId = await ChatRepositoryImpl.getMyActiveRoom(accessToken);
            setActiveRoomId(roomId);

            setIsLoggedIn(true);
        } catch (e) {
            console.error(e);
        }
    };

    // ✅ 로그아웃 함수
    const logout = async () => {
        try {
            await UserAuthRepositoryImpl.logout(); 
        } catch (e) {
            console.error("Logout failed:", e);
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'isAutoLogin', 'isAdmin', 'userId']);
        } finally {
            setToken(null);
            setIsLoggedIn(false);
            setIsAdmin(false);
            setCurrentUserId(null);
            setActiveRoomId(null); // ✨ 초기화
        }
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, token, loading, isAdmin, currentUserId, activeRoomId, checkActiveRoom, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};