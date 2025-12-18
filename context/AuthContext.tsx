import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CookieManager from '@react-native-cookies/cookies';
import { UserAuthRepositoryImpl } from '../data/repositoriesImpl/UserAuthRepositoryImpl';
import { ChatRepositoryImpl } from '../data/repositoriesImpl/ChatRepositoryImpl';
import { webSocketClient } from '../core/utils/WebSocketClient';
import { Alert } from 'react-native';
import { API_BASE_URL } from "@env";
import { setFallbackToken, setOnUnauthorizedCallback } from '../data/api/apiClientUtils';

// ✨ AlarmItem 타입 정의
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
    alarms: AlarmItem[];
    unreadAlarmCount: number;
    checkActiveRoom: () => Promise<void>;
    login: (accessToken?: string | null, isAutoLogin?: boolean, isAdmin?: boolean, userId?: number) => Promise<void>;
    logout: () => Promise<void>;
    setAlarmScreenActive: (active: boolean) => void;
    markAllAlarmsRead: () => void;
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
    setAlarmScreenActive: () => { },
    markAllAlarmsRead: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [activeRoomId, setActiveRoomId] = useState<number | null>(null);

    const [alarms, setAlarms] = useState<AlarmItem[]>([]);
    const [unreadAlarmCount, setUnreadAlarmCount] = useState<number>(0);
    const alarmScreenActiveRef = useRef(false);

    // 🚨 전역 로그아웃 감지 등록
    useEffect(() => {
        setOnUnauthorizedCallback(() => {
            console.log("🚨 [전역 감지] 토큰 갱신 불가. 로그아웃 진행...");
            if (isLoggedIn) {
                Alert.alert("알림", "세션이 만료되어 다시 로그인해야 합니다.");
                logout();
            }
        });
        return () => setOnUnauthorizedCallback(null);
    }, [isLoggedIn, logout]);

    const MAX_ALARMS = 99;
    const ALARM_LIST_KEY = (uid: number) => `alarms:${uid}`;
    const ALARM_COUNT_KEY = (uid: number) => `unreadAlarmCount:${uid}`;

    const loadAlarmState = async (uid: number) => {
        try {
            const [listRaw, countRaw] = await AsyncStorage.multiGet([
                ALARM_LIST_KEY(uid),
                ALARM_COUNT_KEY(uid),
            ]);

            const listStr = listRaw?.[1];
            const countStr = countRaw?.[1];

            if (listStr) {
                const parsed = JSON.parse(listStr) as AlarmItem[];
                if (Array.isArray(parsed)) setAlarms(parsed);
            }

            if (countStr != null) {
                const n = parseInt(countStr, 10);
                if (!Number.isNaN(n)) setUnreadAlarmCount(n);
            }
        } catch (e) {
            console.warn('[AuthContext] loadAlarmState failed:', e);
        }
    };

    const persistAlarmList = (uid: number, list: AlarmItem[]) => {
        AsyncStorage.setItem(ALARM_LIST_KEY(uid), JSON.stringify(list)).catch(() => { });
    };

    const persistAlarmCount = (uid: number, count: number) => {
        AsyncStorage.setItem(ALARM_COUNT_KEY(uid), String(count)).catch(() => { });
    };

    const setAlarmScreenActive = (active: boolean) => {
        alarmScreenActiveRef.current = active;
    };

    const markAllAlarmsRead = () => {
        setUnreadAlarmCount(0);
        if (currentUserId != null) persistAlarmCount(currentUserId, 0);

        setAlarms((prev) => {
            const updated = prev.map((a) => ({ ...a, read: true }));
            if (currentUserId != null) persistAlarmList(currentUserId, updated);
            return updated;
        });
    };

    const getTokenFromCookie = async (): Promise<string | null> => {
        try {
            const cookies = await CookieManager.get(API_BASE_URL);
            if (cookies.accessToken) return cookies.accessToken.value;
            if (cookies.access_token) return cookies.access_token.value;
            if (cookies.Authorization) return cookies.Authorization.value;
            return null;
        } catch (e) {
            console.warn("[AuthContext] 쿠키 로드 실패:", e);
            return null;
        }
    };

    const logout = useCallback(async () => {
        try {
            await UserAuthRepositoryImpl.logout();
        } catch (e) {
            console.error("Logout failed:", e);
            try { await CookieManager.clearAll(); } catch { }
            await AsyncStorage.multiRemove(['isAutoLogin', 'isAdmin', 'userId']);
        } finally {
            try {
                webSocketClient.disconnect?.();
                webSocketClient.disconnectMatching?.();
                webSocketClient.disconnectGlobal?.();
            } catch (e) { }

            setToken(null);
            setFallbackToken(null);
            setIsLoggedIn(false);
            setIsAdmin(false);
            setCurrentUserId(null);
            setActiveRoomId(null);
            setAlarms([]);
            setUnreadAlarmCount(0);
        }
    }, []);

    const checkActiveRoom = async () => {
        const currentToken = await getTokenFromCookie();
        if (!currentToken) return;
        try {
            const roomId = await ChatRepositoryImpl.getMyActiveRoom(currentToken);
            setActiveRoomId(roomId);
        } catch (e) {
            console.error("[AuthContext] 방 확인 실패:", e);
        }
    };

    const loadToken = async () => {
        try {
            setLoading(true);
            const storedAccessToken = await getTokenFromCookie();
            const storedIsAutoLogin = await AsyncStorage.getItem('isAutoLogin');
            const storedIsAdmin = await AsyncStorage.getItem('isAdmin');
            const storedUserId = await AsyncStorage.getItem('userId');

            if (storedAccessToken && storedIsAutoLogin === 'true' && storedUserId) {
                try {
                    await UserAuthRepositoryImpl.getMyProfile();
                } catch (verifyError: any) {
                    try {
                        await UserAuthRepositoryImpl.refreshAccessToken();
                        const newToken = await getTokenFromCookie();
                        if (newToken) {
                            setToken(newToken);
                            setFallbackToken(newToken);
                        } else {
                            throw new Error("갱신 후 토큰을 찾을 수 없음");
                        }
                    } catch (refreshError) {
                        await logout();
                        return;
                    }
                }

                try {
                    const parsedUserId = parseInt(storedUserId);
                    const currentToken = await getTokenFromCookie();
                    if (!currentToken) throw new Error("토큰 없음");

                    setToken(currentToken);
                    setFallbackToken(currentToken);
                    setIsLoggedIn(true);
                    setIsAdmin(storedIsAdmin === 'true');
                    setCurrentUserId(parsedUserId);
                    await loadAlarmState(parsedUserId);

                    webSocketClient.connectGlobal(currentToken, parsedUserId, {
                        onForceLogout: (message) => {
                            Alert.alert("알림", message || "관리자에 의해 로그아웃되었습니다.");
                            logout();
                        },
                        onAlarm: (alarmData) => {
                            Alert.alert(alarmData.title || "새로운 알림", alarmData.body || alarmData.message);
                            const next: AlarmItem = {
                                id: alarmData.id,
                                message: alarmData.message ?? alarmData.body ?? alarmData.content ?? "",
                                createdAt: alarmData.createdAt,
                                read: false,
                            };
                            setAlarms((prev) => {
                                const updated = [next, ...prev].slice(0, MAX_ALARMS);
                                persistAlarmList(parsedUserId, updated);
                                return updated;
                            });
                            if (!alarmScreenActiveRef.current) {
                                setUnreadAlarmCount((c) => {
                                    const nextCount = c + 1;
                                    persistAlarmCount(parsedUserId, nextCount);
                                    return nextCount;
                                });
                            }
                        }
                    });

                    const roomId = await ChatRepositoryImpl.getMyActiveRoom(currentToken);
                    setActiveRoomId(roomId);
                } catch (setupError) {
                    await logout();
                }
            } else {
                await logout();
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

    const login = async (accessTokenArg?: string | null, isAutoLogin?: boolean, isAdmin?: boolean, userId?: number) => {
        try {
            if (isAutoLogin !== undefined) await AsyncStorage.setItem('isAutoLogin', isAutoLogin ? 'true' : 'false');
            if (isAdmin !== undefined) await AsyncStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
            if (userId !== undefined) await AsyncStorage.setItem('userId', userId.toString());

            let currentToken = await getTokenFromCookie();
            if (!currentToken && accessTokenArg) currentToken = accessTokenArg;

            if (!currentToken) {
                setIsLoggedIn(false);
                return;
            } else {
                setToken(currentToken);
                setFallbackToken(currentToken);
                if (isAdmin !== undefined) setIsAdmin(isAdmin);
                if (userId !== undefined) setCurrentUserId(userId);
                if (userId) await loadAlarmState(userId);
                if (userId && currentToken) {
                    const roomId = await ChatRepositoryImpl.getMyActiveRoom(currentToken);
                    setActiveRoomId(roomId);
                    webSocketClient.connectGlobal(currentToken, userId, {
                        onForceLogout: (message) => {
                            Alert.alert("알림", message || "관리자에 의해 로그아웃되었습니다.");
                            logout();
                        },
                        onAlarm: (alarmData) => {
                            Alert.alert(alarmData.title || "새로운 알림", alarmData.body || alarmData.message);
                            const next: AlarmItem = {
                                id: alarmData.id,
                                message: alarmData.message ?? alarmData.body ?? alarmData.content ?? "",
                                createdAt: alarmData.createdAt,
                                read: false,
                            };
                            setAlarms((prev) => {
                                const updated = [next, ...prev].slice(0, MAX_ALARMS);
                                if (userId) persistAlarmList(userId, updated);
                                return updated;
                            });
                            if (!alarmScreenActiveRef.current) {
                                setUnreadAlarmCount((c) => {
                                    const nextCount = c + 1;
                                    if (userId) persistAlarmCount(userId, nextCount);
                                    return nextCount;
                                });
                            }
                        }
                    });
                }
                setIsLoggedIn(true);
            }
        } catch (e) {
            setIsLoggedIn(false);
        }
    };

    // ✨ 7분 주기 자동 갱신 타이머 유지 (에러 처리만 인터셉터와 맞춤)
    useEffect(() => {
        if (isLoggedIn && currentUserId) {
            const interval = setInterval(async () => {
                console.log("🔄 [AuthContext] Access Token 정기 갱신 중...");
                try {
                    await UserAuthRepositoryImpl.refreshAccessToken();
                } catch (error) {
                    console.log("⚠️ 정기 갱신 타이머 실패 (인터셉터가 처리할 수 있음)");
                }
            }, 7 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [isLoggedIn, currentUserId]);

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
