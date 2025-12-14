import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

import { UserAuthRepositoryImpl } from "../data/repositoriesImpl/UserAuthRepositoryImpl";
import { webSocketClient } from "../core/utils/WebSocketClient";
import { ChatRepositoryImpl } from "../data/repositoriesImpl/ChatRepositoryImpl";

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
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
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

  
  const loadToken = async () => {
    try {
      setLoading(true);

      const storedAccessToken = await AsyncStorage.getItem("accessToken");
      const storedIsAutoLogin = await AsyncStorage.getItem("isAutoLogin");
      const storedIsAdmin = await AsyncStorage.getItem("isAdmin");
      const storedUserId = await AsyncStorage.getItem("userId");

      if (storedAccessToken && storedIsAutoLogin === "true") {
        setToken(storedAccessToken);
        setIsAdmin(storedIsAdmin === "true");
        setCurrentUserId(storedUserId ? parseInt(storedUserId, 10) : null);
        setIsLoggedIn(true);
      } else if (storedAccessToken && storedIsAutoLogin !== "true") {
        await AsyncStorage.multiRemove(["accessToken", "isAutoLogin", "isAdmin", "userId"]);
        setToken(null);
        setIsLoggedIn(false);
        setIsAdmin(false);
        setCurrentUserId(null);
        setActiveRoomId(null);
      }
    } catch (e) {
      console.error("Failed to load token", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    if (!token || !isLoggedIn) return;
    checkActiveRoom();
  }, [token, isLoggedIn]);

  const login = async (accessToken: string, isAutoLogin: boolean, admin: boolean, userId: number) => {
    try {
      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("isAutoLogin", isAutoLogin ? "true" : "false");
      await AsyncStorage.setItem("isAdmin", admin ? "true" : "false");
      await AsyncStorage.setItem("userId", String(userId));

      setToken(accessToken);
      setIsAdmin(admin);
      setCurrentUserId(userId);
      setIsLoggedIn(true);

      // (선택) 로그인 직후 방상태 확인
      // await checkActiveRoom(); // token state 반영 전에 호출될 수 있어 useEffect쪽이 안전
    } catch (e) {
      console.error(e);
    }
  };

  const logout = async () => {
    try {
      await UserAuthRepositoryImpl.logout();
    } catch (e) {
      console.error("Logout failed:", e);
      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "isAutoLogin", "isAdmin", "userId"]);
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
      setActiveRoomId(null);

      setAlarms([]);
      setUnreadAlarmCount(0);
    }
  };

  useEffect(() => {
    if (!token || !isLoggedIn) return;

    webSocketClient.connectAccount?.(token, async (msg: string) => {
      Alert.alert("로그아웃", msg || "계정 상태가 변경되어 로그아웃되었습니다.");
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

        setAlarms((prev) => [next, ...prev]);

        if (!alarmScreenActiveRef.current) {
          setUnreadAlarmCount((c) => c + 1);
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

        activeRoomId,
        checkActiveRoom,

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
