import React, { createContext, useContext, useEffect, useState } from "react";
import { LogBox } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging, { AuthorizationStatus } from '@react-native-firebase/messaging';
import { UserAuthRepositoryImpl } from "../data/repositoriesImpl/UserAuthRepositoryImpl";

// 🔇 노란색 경고창 무시 (Firebase 관련)
LogBox.ignoreLogs([
    "This method is deprecated",
    "React Native Firebase",
]);

interface AuthState {
    isLoggedIn: boolean;
    isAdmin: boolean;
    token: string | null;
    loading: boolean;
    login: (token: string, isAdmin: boolean, refreshToken?: string, saveToStorage?: boolean) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({ children }: any) => {
    const [token, setToken] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // 🛠️ [FCM] 토큰 동기화
    const syncFcmToken = async () => {
        try {
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === AuthorizationStatus.AUTHORIZED ||
                authStatus === AuthorizationStatus.PROVISIONAL;

            if (enabled) {
                const fcmToken = await messaging().getToken();
                if (fcmToken) {
                    console.log("📲 [FCM] 기기 토큰 획득:", fcmToken);
                    await UserAuthRepositoryImpl.registerFcmToken(fcmToken);
                    console.log("✅ [FCM] 서버 등록 완료");
                }
            }
        } catch (e) {
            console.log("⚠️ [FCM] 토큰 연동 실패 (로그인은 유지됨):", e);
        }
    };

    // 🚀 1. 앱 실행 시 초기화
    useEffect(() => {
        const initAuth = async () => {
            try {
                const isAutoLogin = await AsyncStorage.getItem("isAutoLogin");
                const storedToken = await AsyncStorage.getItem("accessToken");
                const storedIsAdmin = await AsyncStorage.getItem("isAdmin");

                if (isAutoLogin !== "true" || !storedToken) {
                    await logout();
                    return;
                }

                setToken(storedToken);
                setIsAdmin(storedIsAdmin === "true");

                console.log("🔄 [Auth] 자동 로그인 & 토큰 검사 중...");
                await UserAuthRepositoryImpl.getMyProfile();

                console.log("✅ [Auth] 자동 로그인 성공");
                syncFcmToken();

            } catch (e) {
                console.error("❌ [Auth] 자동 로그인 실패 (재로그인 필요)", e);
                await logout();
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    // 🚀 2. 로그인 (안전장치 포함)
    const login = async (
        newToken: string,
        newIsAdmin: boolean,
        refreshToken?: string,
        saveToStorage: boolean = true
    ) => {
        try {
            console.log("📥 로그인 시도 데이터:", { newToken, newIsAdmin, saveToStorage });

            if (!newToken) {
                console.error("❌ [Auth] Error: 로그인 토큰이 비어있습니다.");
                return;
            }

            setToken(newToken);
            setIsAdmin(newIsAdmin);

            const tasks: [string, string][] = [
                ["accessToken", String(newToken)],
                ["isAdmin", newIsAdmin ? "true" : "false"],
                ["isAutoLogin", saveToStorage ? "true" : "false"]
            ];

            if (refreshToken) {
                tasks.push(["refreshToken", String(refreshToken)]);
            }

            await AsyncStorage.multiSet(tasks);
            console.log("✅ [Auth] 토큰 저장 완료");

            await syncFcmToken();

        } catch (e) {
            console.error("❌ [Auth] 토큰 저장 중 예외 발생:", e);
        }
    };

    // 🚀 3. 로그아웃 (🔥 강력한 확인사살 버전)
    const logout = async () => {
        console.log("🚪 [Auth] 로그아웃 프로세스 시작...");
        try {
            // 1. 핵심 키 삭제 시도
            await AsyncStorage.multiRemove(["accessToken", "refreshToken", "isAdmin", "isAutoLogin"]);

            // 2. 🔍 [확인사살] 진짜 지워졌는지 조회
            const checkToken = await AsyncStorage.getItem("accessToken");

            if (!checkToken) {
                console.log("✅ [Auth] 저장소 토큰 삭제 완료 (Clean)");
            } else {
                console.error("😱 [Auth] 경고: 토큰이 안 지워지고 살아있음! 강제 초기화 진행.");
                // 키 지정 삭제가 실패했으면, 저장소 전체를 날려버림 (최후의 수단)
                await AsyncStorage.clear();
            }

            // 3. 앱 상태 초기화
            setToken(null);
            setIsAdmin(false);

        } catch (e) {
            console.error("❌ [Auth] 로그아웃 중 치명적 에러:", e);
        }
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn: !!token, isAdmin, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("AuthProvider Error");
    return ctx;
};