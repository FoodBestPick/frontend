import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserAuthRepositoryImpl } from '../data/repositoriesImpl/UserAuthRepositoryImpl'; 
import { ChatRepositoryImpl } from '../data/repositoriesImpl/ChatRepositoryImpl';
import { webSocketClient } from '../core/utils/WebSocketClient'; // WebSocketClient 임포트
import { Alert } from 'react-native';

interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  currentUserId: number | null;
  activeRoomId: number | null;
  checkActiveRoom: () => Promise<void>;
  login: (accessToken: string, isAutoLogin: boolean, isAdmin: boolean, userId: number) => Promise<void>;
  logout: () => Promise<void>;
  alarms: AlarmItem[];
  unreadAlarmCount: number;
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
  checkActiveRoom: async () => {},

  login: async () => {},
  logout: async () => {},

  alarms: [],
  unreadAlarmCount: 0,
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
    const [activeRoomId, setActiveRoomId] = useState<number | null>(null); // ✨ 추가

    // ✅ 로그아웃 함수 (이전에 정의되어 있으나 웹소켓 해제 로직 추가를 위해 이동/정의)
    const logout = async () => {
        try {
            await UserAuthRepositoryImpl.logout(); 
        } catch (e) {
            console.error("Logout failed:", e);
            // API 호출 실패와 관계없이 로컬 스토리지 비움
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'isAutoLogin', 'isAdmin', 'userId']);
        } finally {
            setToken(null);
            setIsLoggedIn(false);
            setIsAdmin(false);
            setCurrentUserId(null);
            setActiveRoomId(null); // ✨ 초기화
            webSocketClient.disconnectGlobal(); // 전역 웹소켓 연결 해제
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
                 logout(); // 웹소켓 해제 포함
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
                const roomId = await ChatRepositoryImpl.getMyActiveRoom(storedAccessToken);
                setActiveRoomId(roomId);

                // ✨ 전역 웹소켓 연결
                webSocketClient.connectGlobal(storedAccessToken, parsedUserId, {
                    onForceLogout: (message) => {
                        Alert.alert("알림", message || "관리자에 의해 로그아웃되었습니다.");
                        logout();
                    },
                    onAlarm: (alarmData) => {
                        Alert.alert(alarmData.title || "새로운 알림", alarmData.body || alarmData.message);
                        // TODO: 알림 배지 업데이트 로직 추가 가능
                    }
                });

            } else if (storedAccessToken && storedIsAutoLogin !== 'true') {
                await AsyncStorage.multiRemove(['accessToken', 'isAutoLogin', 'isAdmin', 'userId']);
                setToken(null);
                setIsLoggedIn(false);
                setIsAdmin(false);
                setCurrentUserId(null);
                setActiveRoomId(null);
                webSocketClient.disconnectGlobal(); // 전역 웹소켓 연결 해제
            }

        } catch (e) {
            console.error('Failed to load token', e);
        } finally {
            setLoading(false);
        }
    };
  }, [token, isLoggedIn]);

    useEffect(() => {
        loadToken();
        // 컴포넌트 언마운트 시 웹소켓 정리
        return () => {
            webSocketClient.disconnectGlobal();
        };
    }, []); // 빈 배열: 최초 1회만 실행

    try {
      webSocketClient.connectAlarm?.(token, currentUserId, (alarm: any) => {
        const next: AlarmItem = {
          id: alarm.id,
          message: alarm.message ?? alarm.body ?? alarm.content ?? "",
          createdAt: alarm.createdAt,
          read: false,
        };

            // ✨ 로그인 시 전역 웹소켓 연결
            webSocketClient.connectGlobal(accessToken, userId, {
                onForceLogout: (message) => {
                    Alert.alert("알림", message || "관리자에 의해 로그아웃되었습니다.");
                    logout();
                },
                onAlarm: (alarmData) => {
                    Alert.alert(alarmData.title || "새로운 알림", alarmData.body || alarmData.message);
                }
            });

            setIsLoggedIn(true);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, token, loading, isAdmin, currentUserId, activeRoomId, checkActiveRoom, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
