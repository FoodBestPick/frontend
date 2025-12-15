import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Image,
    StatusBar,
    ActivityIndicator,
    Alert
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import CheckBox from "@react-native-community/checkbox";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types/RootStackParamList";

// ViewModel들
import { LoginKakaoViewModels } from "../viewmodels/LoginKakaoViewModels";
import { useLoginGoogleViewModel } from "../viewmodels/LoginGoogleViewModels";
import { useLoginNaverViewModels } from "../viewmodels/LoginNaverViewModels";
// 진짜 로그인 ViewModel
import { useSigninViewModel } from "../viewmodels/useSigninViewModel";

import { GoogleSignin } from "@react-native-google-signin/google-signin";
import NaverLogin from "@react-native-seoul/naver-login";
import {
    GOOGLE_WEB_CLIENT_ID,
    NAVER_APP_NAME,
    NAVER_CLIENT_ID,
    NAVER_CLIENT_SECRET,
} from "@env";

import { storage } from "../../utils/Storage";

type Navigation = NativeStackNavigationProp<RootStackParamList>;
const ORANGE = "#FFA847";

export default function LoginScreen() {
    const navigation = useNavigation<Navigation>();
    const insets = useSafeAreaInsets();

    // ViewModel 연결
    const { signin, loading: emailLoginLoading } = useSigninViewModel();

    // 소셜 로그인 VM
    const kakaoViewModel = new LoginKakaoViewModels();
    const { loginGoogle } = useLoginGoogleViewModel();
    const { login: loginNaver } = useLoginNaverViewModels();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [saveEmail, setSaveEmail] = useState(false);
    const [autoLogin, setAutoLogin] = useState(false);

    // 저장된 이메일 불러오기
    useEffect(() => {
        const loadEmail = async () => {
            const saved = await storage.get("savedEmail");
            if (saved) {
                setEmail(saved);
                setSaveEmail(true);
            }
        };
        loadEmail();
    }, []);

    // 소셜 로그인 SDK 초기화
    useEffect(() => {
        GoogleSignin.configure({
            webClientId: GOOGLE_WEB_CLIENT_ID,
            offlineAccess: true,
        });
        NaverLogin.initialize({
            appName: NAVER_APP_NAME,
            consumerKey: NAVER_CLIENT_ID,
            consumerSecret: NAVER_CLIENT_SECRET,
            serviceUrlSchemeIOS: "naverlogin",
            disableNaverAppAuthIOS: true,
        });
    }, []);

    /* 일반 이메일 로그인 핸들러 */
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("알림", "이메일과 비밀번호를 입력해주세요.");
            return;
        }

        // 1. 이메일 저장 로직
        if (saveEmail) {
            await storage.set("savedEmail", email);
        } else {
            await storage.remove("savedEmail");
        }

        // 2. ViewModel을 통해 진짜 로그인 시도 (자동로그인 여부 전달)
        const success = await signin(email, password, autoLogin);

        if (success) {
            console.log("로그인 성공!");
        }
    };

    /* 소셜 로그인 핸들러들 */
    const handleGoogleLogin = async () => {
        try {
            const result = await GoogleSignin.signIn();
            const idToken = result.data?.idToken;
            if (idToken) await loginGoogle(idToken);
        } catch (error) {
            Alert.alert("구글 로그인 실패");
        }
    };

    const handleNaverLogin = async () => {
        try {
            await loginNaver();
        } catch {
            Alert.alert("네이버 로그인 실패");
        }
    };

    const handleKakaoLogin = async () => {
        try {
            await kakaoViewModel.loginWithKakao();
        } catch {
            Alert.alert("카카오 로그인 실패");
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top + 10 }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <View style={styles.container}>
                <Text style={styles.title}>로그인</Text>

                <Image
                    source={require("../../assets/logo.png")}
                    style={styles.logo}
                />

                <TextInput
                    style={styles.input}
                    placeholder="이메일 입력"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="비밀번호 입력"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <View style={styles.checkboxRow}>
                    <View style={styles.checkboxContainer}>
                        <CheckBox
                            value={saveEmail}
                            onValueChange={setSaveEmail}
                            tintColors={{ true: ORANGE, false: "#999" }}
                        />
                        <Text style={styles.checkboxLabel}>이메일 저장</Text>
                    </View>

                    <View style={styles.checkboxContainer}>
                        <CheckBox
                            value={autoLogin}
                            onValueChange={setAutoLogin}
                            tintColors={{ true: ORANGE, false: "#999" }}
                        />
                        <Text style={styles.checkboxLabel}>자동 로그인</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.loginButton, emailLoginLoading && { opacity: 0.7 }]}
                    onPress={handleLogin}
                    disabled={emailLoginLoading}
                >
                    {emailLoginLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.loginText}>로그인</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.navigate("FindAccount")}
                    style={styles.findContainer}
                >
                    <Text style={styles.findText}>계정 찾기</Text>
                </TouchableOpacity>

                {/* 소셜 로그인 아이콘들 */}
                <View style={styles.socialIcons}>
                    <TouchableOpacity
                        style={[styles.socialCircle, { backgroundColor: "#FEE500" }]}
                        onPress={handleKakaoLogin}
                    >
                        <Image source={require("../../assets/kakao.png")} style={styles.socialIcon} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.socialCircle, { backgroundColor: "#fff" }]}
                        onPress={handleGoogleLogin}
                    >
                        <Image source={require("../../assets/google.png")} style={styles.socialIcon} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.socialCircle, { backgroundColor: "#03C75A" }]}
                        onPress={handleNaverLogin}
                    >
                        <Image source={require("../../assets/naver.png")} style={styles.socialIcon} />
                    </TouchableOpacity>

                    {/* 🗑️ 삭제됨: 빈 View (애플 로그인 자리) */}
                </View>

                <Text style={styles.bottomText}>
                    아직 회원이 아니신가요?{" "}
                    <Text
                        style={styles.link}
                        onPress={() => navigation.navigate("SignUp")}
                    >
                        회원가입하기
                    </Text>
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#fff" },
    container: { flex: 1, alignItems: "center", paddingHorizontal: 28 },
    title: { fontSize: 22, fontWeight: "700", color: "#000", marginBottom: 12 },
    logo: { width: 100, height: 100, resizeMode: "contain", marginBottom: 24 },
    input: {
        width: "100%",
        height: 46,
        backgroundColor: "#F6F6F6",
        borderRadius: 10,
        paddingHorizontal: 14,
        fontSize: 14,
        marginBottom: 14,
        color: '#000', // 입력 텍스트 색상을 검은색으로 지정
    },
    checkboxRow: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    checkboxContainer: { flexDirection: "row", alignItems: "center" },
    checkboxLabel: { fontSize: 13, color: "#333" },
    loginButton: {
        backgroundColor: ORANGE,
        width: "100%",
        height: 50,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 4,
    },
    loginText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    findContainer: { width: "100%", alignItems: "flex-end", marginTop: 10 },
    findText: { color: "#999", fontSize: 13 },
    socialIcons: { flexDirection: "row", justifyContent: "center" },
    socialIcon: { width: 24, height: 24, marginTop: 8, alignSelf: "center" },
    socialCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#eee",
        marginHorizontal: 8,
    },
    bottomText: { fontSize: 13, color: "#999", marginTop: 35 },
    link: { color: ORANGE, fontWeight: "600" },
});