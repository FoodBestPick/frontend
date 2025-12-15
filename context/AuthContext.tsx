import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserAuthRepositoryImpl } from '../data/repositoriesImpl/UserAuthRepositoryImpl'; 
import { ChatRepositoryImpl } from '../data/repositoriesImpl/ChatRepositoryImpl';
import { webSocketClient } from '../core/utils/WebSocketClient'; 
import { Alert } from 'react-native';

// ✨ AlarmItem 타입 정의 추가 (develop 브랜치 호환성)
export type AlarmItem = {
  id?: number;
  message: string;
  createdAt?: string;
  read?: boolean;
};

interface AuthContextType {
    isLoggedIn: boolean;
    token: string | null;
    loading: boolean;
    isAdmin: boolean;
    currentUserId: number | null;
    activeRoomId: number | null; 
    alarms: AlarmItem[]; // ✨ 추가
    unreadAlarmCount: number; // ✨ 추가
    checkActiveRoom: () => Promise<void>; 
    login: (accessToken: string, isAutoLogin: boolean, isAdmin: boolean, userId: number) => Promise<void>;
    logout: () => Promise<void>;
    setAlarmScreenActive: (active: boolean) => void; // ✨ 추가
    markAllAlarmsRead: () => void; // ✨ 추가
}

export const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    token: null,
    loading: true,
    isAdmin: false,
    currentUserId: null,
    activeRoomId: null,
    alarms: [],
    unreadAlarmCount: 0,
    checkActiveRoom: async () => { },
    login: async () => { },
    logout: async () => { },
    setAlarmScreenActive: () => {},
    markAllAlarmsRead: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
    
    // ✨ develop 브랜치 기능 호환을 위한 상태
    const [alarms, setAlarms] = useState<AlarmItem[]>([]);
    const [unreadAlarmCount, setUnreadAlarmCount] = useState<number>(0);
    const alarmScreenActiveRef = useRef(false);

    const setAlarmScreenActive = (active: boolean) => {
        alarmScreenActiveRef.current = active;
    };

    const markAllAlarmsRead = () => {
        setUnreadAlarmCount(0);
        setAlarms((prev) => prev.map((a) => ({ ...a, read: true })));
    };

    // ✅ 로그아웃 함수
    const logout = async () => {
        try {
            await UserAuthRepositoryImpl.logout(); 
        } catch (e) {
            console.error("Logout failed:", e);
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'isAutoLogin', 'isAdmin', 'userId']);
        } finally {
            try {
                // 기존 연결 모두 해제 시도
                webSocketClient.disconnect?.();
                webSocketClient.disconnectMatching?.();
                webSocketClient.disconnectGlobal?.(); // ✨ 우리가 추가한 메서드
            } catch (e) {}

            setToken(null);
            setIsLoggedIn(false);
            setIsAdmin(false);
            setCurrentUserId(null);
            setActiveRoomId(null); 
            setAlarms([]);
            setUnreadAlarmCount(0);
        }
    };

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
            const currentToken = await AsyncStorage.getItem('accessToken');
            if (!currentToken) {
                 console.log("[AuthContext] 토큰이 유효하지 않아 로그아웃 처리합니다.");
                 logout();
            }
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

            if (storedAccessToken && storedIsAutoLogin === 'true' && storedUserId) {
                const parsedUserId = parseInt(storedUserId);
                setToken(storedAccessToken);
                setIsLoggedIn(true);
                setIsAdmin(storedIsAdmin === 'true');
                setCurrentUserId(parsedUserId);
                
                // ✨ 저장된 토큰으로 방 확인
                // const roomId = await ChatRepositoryImpl.getMyActiveRoom(storedAccessToken);
                // setActiveRoomId(roomId);

                // ✨ 전역 웹소켓 연결 (실시간 알림 및 강제 로그아웃)
                webSocketClient.connectGlobal(storedAccessToken, parsedUserId, {
                    onForceLogout: (message) => {
                        Alert.alert("알림", message || "관리자에 의해 로그아웃되었습니다.");
                        logout();
                    },
                    onAlarm: (alarmData) => {
                        Alert.alert(alarmData.title || "새로운 알림", alarmData.body || alarmData.message);
                        
                        // develop 브랜치 로직 통합: 로컬 알람 상태 업데이트
                        const next: AlarmItem = {
                            id: alarmData.id,
                            message: alarmData.message ?? alarmData.body ?? alarmData.content ?? "",
                            createdAt: alarmData.createdAt,
                            read: false,
                        };
                        setAlarms((prev) => [next, ...prev]);
                        if (!alarmScreenActiveRef.current) {
                            setUnreadAlarmCount((c) => c + 1);
                        }
                    }
                });

            } else if (storedAccessToken && storedIsAutoLogin !== 'true') {
                await AsyncStorage.multiRemove(['accessToken', 'isAutoLogin', 'isAdmin', 'userId']);
                setToken(null);
                setIsLoggedIn(false);
                setIsAdmin(false);
                setCurrentUserId(null);
                setActiveRoomId(null);
                webSocketClient.disconnectGlobal();
            }

        } catch (e) {
            console.error('Failed to load token', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadToken();
        return () => {
            webSocketClient.disconnectGlobal();
        };
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

            // ✨ 로그인 시 전역 웹소켓 연결
            webSocketClient.connectGlobal(accessToken, userId, {
                onForceLogout: (message) => {
                    Alert.alert("알림", message || "관리자에 의해 로그아웃되었습니다.");
                    logout();
                },
                onAlarm: (alarmData) => {
                    Alert.alert(alarmData.title || "새로운 알림", alarmData.body || alarmData.message);
                    
                    // develop 브랜치 로직 통합
                    const next: AlarmItem = {
                        id: alarmData.id,
                        message: alarmData.message ?? alarmData.body ?? alarmData.content ?? "",
                        createdAt: alarmData.createdAt,
                        read: false,
                    };
                    setAlarms((prev) => [next, ...prev]);
                    if (!alarmScreenActiveRef.current) {
                        setUnreadAlarmCount((c) => c + 1);
                    }
                }
            });

            setIsLoggedIn(true);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            isLoggedIn, token, loading, isAdmin, currentUserId, activeRoomId, 
            alarms, unreadAlarmCount, 
            checkActiveRoom, login, logout, 
            setAlarmScreenActive, markAllAlarmsRead 
        }}>
            {children}
        </AuthContext.Provider>
    );
};