import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CookieManager from '@react-native-cookies/cookies';
import { UserAuthRepositoryImpl } from '../data/repositoriesImpl/UserAuthRepositoryImpl';
import { ChatRepositoryImpl } from '../data/repositoriesImpl/ChatRepositoryImpl';
import { webSocketClient } from '../core/utils/WebSocketClient';
import { Alert } from 'react-native';
import { API_BASE_URL } from "@env";

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

    // Upstream에서 추가된 알람 관련 상수 및 헬퍼 함수 통합
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

    // 🍪 쿠키에서 토큰 가져오는 헬퍼 함수
    const getTokenFromCookie = async (): Promise<string | null> => {
        try {
            const cookies = await CookieManager.get(API_BASE_URL);

            // 1. accessToken
            if (cookies.accessToken) return cookies.accessToken.value;
            // 2. access_token
            if (cookies.access_token) return cookies.access_token.value;
            // 3. Authorization (Bearer 제외 필요할 수도 있음)
            if (cookies.Authorization) return cookies.Authorization.value;

            return null;
        } catch (e) {
            console.warn("[AuthContext] 쿠키 로드 실패:", e);
            return null;
        }
    };

    // ✅ 로그아웃 함수
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
            setIsLoggedIn(false);
            setIsAdmin(false);
            setCurrentUserId(null);
            setActiveRoomId(null);
            setAlarms([]);
            setUnreadAlarmCount(0);
        }
    }, []);

    // ✨ 내 방 확인 함수
    const checkActiveRoom = async () => {
        const currentToken = await getTokenFromCookie();
        if (!currentToken) return;

        try {
            console.log("[AuthContext] 방 확인 시작 (Token exists in cookie)");
            const roomId = await ChatRepositoryImpl.getMyActiveRoom(currentToken);
            setActiveRoomId(roomId);
        } catch (e) {
            console.error("[AuthContext] 방 확인 실패:", e);
        }
    };

    // 🚀 앱 시작 시 토큰 및 isAdmin 로드 로직
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

                    const parsedUserId = parseInt(storedUserId);

                    setToken(storedAccessToken);
                    setIsLoggedIn(true);
                    setIsAdmin(storedIsAdmin === 'true');
                    setCurrentUserId(parsedUserId);

                    // 알람 상태 로드 (Upstream 기능)
                    await loadAlarmState(parsedUserId);

                    webSocketClient.connectGlobal(storedAccessToken, parsedUserId, {
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

                            // 알람 저장 및 상태 업데이트 (Upstream 기능 통합)
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

                    const roomId = await ChatRepositoryImpl.getMyActiveRoom(storedAccessToken);
                    setActiveRoomId(roomId);

                } catch (verifyError) {
                    console.error("❌ 자동 로그인 토큰 검증 실패:", verifyError);
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

    // ✅ 로그인 함수
    const login = async (accessTokenArg?: string | null, isAutoLogin?: boolean, isAdmin?: boolean, userId?: number) => {
        try {
            if (isAutoLogin !== undefined) {
                await AsyncStorage.setItem('isAutoLogin', isAutoLogin ? 'true' : 'false');
            }
            if (isAdmin !== undefined) {
                await AsyncStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
            }
            if (userId !== undefined) {
                await AsyncStorage.setItem('userId', userId.toString());
            }

            let currentToken = await getTokenFromCookie();

            // ⚠️ 쿠키가 바로 안 잡힐 수 있으므로 재시도 로직 추가
            if (!currentToken && !accessTokenArg) {
                for (let i = 1; i <= 3; i++) {
                    console.log(`⏳ [AuthContext] 토큰 재조회 시도 ${i}/3...`);
                    await new Promise(resolve => setTimeout(() => resolve(null), 500)); // 0.5초 대기
                    currentToken = await getTokenFromCookie();
                    if (currentToken) {
                        console.log(`✅ [AuthContext] 재조회 성공! (${i}번째 시도)`);
                        break;
                    }
                }
            }

            if (!currentToken && accessTokenArg) {
                currentToken = accessTokenArg;
            }

            if (!currentToken) {
                console.error("🚨 [AuthContext] 로그인 후 유효한 토큰을 찾을 수 없습니다.");
                setIsLoggedIn(false);
                return;
            } else {
                setToken(currentToken);

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
            console.error(e);
            setIsLoggedIn(false);
        }
    };

    const refreshIntervalRef = useRef<number | null>(null);

    // ✨ 토큰 갱신 타이머
    useEffect(() => {
        const setupRefresh = () => {
            if (isLoggedIn && currentUserId) {
                if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);

                refreshIntervalRef.current = setInterval(async () => {
                    console.log("🔄 [AuthContext] Access Token 갱신 타이머 동작...");
                    try {
                        await UserAuthRepositoryImpl.refreshAccessToken(); // 쿠키 갱신

                        const newToken = await getTokenFromCookie();

                        if (newToken) {
                            setToken(newToken);

                            webSocketClient.disconnectGlobal();
                            webSocketClient.connectGlobal(newToken, currentUserId, {
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
                                        persistAlarmList(currentUserId, updated);
                                        return updated;
                                    });

                                    if (!alarmScreenActiveRef.current) {
                                        setUnreadAlarmCount((c) => {
                                            const nextCount = c + 1;
                                            persistAlarmCount(currentUserId, nextCount);
                                            return nextCount;
                                        });
                                    }
                                }
                            });
                        } else {
                            logout();
                        }

                    } catch (error: any) {
                        console.error("❌ [AuthContext] Access Token 타이머 갱신 실패:", error);
                        let alertMessage = "세션이 만료되어 다시 로그인해야 합니다.";

                        if (error.response && error.response.status === 401) {
                            alertMessage = "세션이 만료되었습니다. 다시 로그인해주세요.";
                        } else if (error.message && error.message.includes("AuthError: NEW_ACCESS_TOKEN_NOT_FOUND")) {
                            alertMessage = "새로운 토큰을 받아오지 못했습니다. 다시 로그인해주세요.";
                        } else if (error.message) {
                            alertMessage = `토큰 갱신 실패: ${error.message}. 다시 로그인해주세요.`;
                        }

                        Alert.alert("알림", alertMessage);
                        logout();
                        if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
                    }
                }, 7 * 60 * 1000); // 7분으로 변경
            } else {
                if (refreshIntervalRef.current) {
                    clearInterval(refreshIntervalRef.current);
                    refreshIntervalRef.current = null;
                }
            }
        };

        setupRefresh();
        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
                refreshIntervalRef.current = null;
            }
        };
    }, [isLoggedIn, currentUserId, logout]);

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
