import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

import { UserAuthRepositoryImpl } from '../data/repositoriesImpl/UserAuthRepositoryImpl';
import { webSocketClient } from "../core/utils/WebSocketClient";

export type AlarmItem = {
  id?: number;
  message: string;
  createdAt?: string;
  read?: boolean;
  // 필요하면 type/targetId 등 추가
};

interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  currentUserId: number | null;

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

  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [unreadAlarmCount, setUnreadAlarmCount] = useState(0);
  const alarmScreenActiveRef = useRef(false);

  const setAlarmScreenActive = (active: boolean) => {
    alarmScreenActiveRef.current = active;
  };

  const markAllAlarmsRead = () => {
    setUnreadAlarmCount(0);
    setAlarms(prev => prev.map(a => ({ ...a, read: true })));
  };

  const loadToken = async () => {
    try {
      setLoading(true);
      const storedAccessToken = await AsyncStorage.getItem('accessToken');
      const storedIsAutoLogin = await AsyncStorage.getItem('isAutoLogin');
      const storedIsAdmin = await AsyncStorage.getItem('isAdmin');
      const storedUserId = await AsyncStorage.getItem('userId');

      if (storedAccessToken && storedIsAutoLogin === 'true') {
        setToken(storedAccessToken);
        setIsAdmin(storedIsAdmin === 'true');
        setCurrentUserId(storedUserId ? parseInt(storedUserId, 10) : null);
        setIsLoggedIn(true);
      } else if (storedAccessToken && storedIsAutoLogin !== 'true') {
        await AsyncStorage.multiRemove(['accessToken', 'isAutoLogin', 'isAdmin', 'userId']);
        setToken(null);
        setIsLoggedIn(false);
        setIsAdmin(false);
        setCurrentUserId(null);
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

  const login = async (accessToken: string, isAutoLogin: boolean, isAdmin: boolean, userId: number) => {
    try {
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('isAutoLogin', isAutoLogin ? 'true' : 'false');
      await AsyncStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
      await AsyncStorage.setItem('userId', userId.toString());

      setToken(accessToken);

      setIsAdmin(isAdmin);
      setCurrentUserId(userId);
      setIsLoggedIn(true);
    } catch (e) {
      console.error(e);
    }
  };

  const logout = async () => {
    try {
      await UserAuthRepositoryImpl.logout();
    } catch (e) {
      console.error("Logout failed:", e);
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'isAutoLogin', 'isAdmin', 'userId']);
    } finally {
      try {
        webSocketClient.disconnect?.();
        webSocketClient.disconnectMatching?.();
        webSocketClient.disconnectAccount?.();
        webSocketClient.disconnectAlarm?.();
      } catch (e) {}

      setToken(null);
      setIsLoggedIn(false);
      setIsAdmin(false);
      setCurrentUserId(null);

      setAlarms([]);
      setUnreadAlarmCount(0);
    }
  };

  useEffect(() => {
    if (!token || !isLoggedIn) return;

    webSocketClient.connectAccount?.(token, async (msg: string) => {
      Alert.alert("로그아웃", msg || "계정 상태가 변경되어 로그아웃되었습니다.");

      try {
        webSocketClient.disconnect?.();
        webSocketClient.disconnectMatching?.();
        webSocketClient.disconnectAccount?.();
        webSocketClient.disconnectAlarm?.(); 
      } catch (e) {}

      await logout();
    });

    return () => {
      try {
        webSocketClient.disconnectAccount?.();
      } catch (e) {}
    };
  }, [token, isLoggedIn]);

  useEffect(() => {
    if (!token || !isLoggedIn || !currentUserId) return;

    try {
      webSocketClient.connectAlarm?.(token, currentUserId, (alarm: any) => {
        const next: AlarmItem = {
          id: alarm.id,
          message: alarm.message ?? alarm.body ?? alarm.content ?? "",
          createdAt: alarm.createdAt,
          read: false,
        };

        setAlarms(prev => [next, ...prev]);

        if (!alarmScreenActiveRef.current) {
          setUnreadAlarmCount(c => c + 1);
        }
      });
    } catch (e) {
      console.error("connectAlarm failed:", e);
    }

    return () => {
      try {
        webSocketClient.disconnectAlarm?.();
      } catch (e) {}
    };
  }, [token, isLoggedIn, currentUserId]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        token,
        loading,
        isAdmin,
        currentUserId,
        login,
        logout,

        alarms,
        unreadAlarmCount,
        setAlarmScreenActive,
        markAllAlarmsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
