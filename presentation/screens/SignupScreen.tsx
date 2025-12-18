import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    StatusBar,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types/RootStackParamList";
import { useAlert } from "../../context/AlertContext";

// Components
import { Header } from "../components/Header";

// ViewModel들
import { useSendSignupEmailViewModel } from "../viewmodels/useSendSignupEmailViewModel";
import { useVerifyEmailViewModel } from "../viewmodels/useVerifyEmailViewModel";
import { useSignupViewModel } from "../viewmodels/useSignupViewModel";
import { useCheckNicknameViewModel } from "../viewmodels/useCheckNicknameViewModel";

type Navigation = NativeStackNavigationProp<RootStackParamList>;
const ORANGE = "#FFA847";

// 비밀번호 규칙: 영문+숫자 10자~20자 (특수문자 필수 아님)
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{10,20}$/;

export default function SignupScreen() {
    const navigation = useNavigation<Navigation>();
    const insets = useSafeAreaInsets();
    const { showAlert } = useAlert();

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [nickname, setNickname] = useState("");

    const [emailSent, setEmailSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    // 🔗 ViewModel 연결
    const { sendEmail, loading: sendLoading } = useSendSignupEmailViewModel();
    const { verify, loading: verifyLoading } = useVerifyEmailViewModel();
    const { signup, loading: signupLoading, error } = useSignupViewModel();

    // 닉네임 ViewModel (이제 UseCase를 타고 Repository로 감)
    const {
        isAvailable: isNicknameAvailable,
        isLoading: nicknameLoading,
        check: checkNicknameVM,
        setIsAvailable
    } = useCheckNicknameViewModel();

    const isLoading = sendLoading || verifyLoading || signupLoading || nicknameLoading;

    // 화면 포커스 시 상태 초기화 (앱 재실행 효과)
    useFocusEffect(
        useCallback(() => {
            return () => {
                console.log("SignupScreen 나감 - 상태 초기화");
                setEmailSent(false);
                setIsEmailVerified(false);
                setCode("");
                // setEmail(""); // 필요하면 주석 해제
                // setNickname("");
            };
        }, [])
    );

    // 📩 인증번호 전송 / 확인
    const handleEmailPress = async () => {
        if (!email) {
            showAlert({ title: "알림", message: "이메일을 입력해주세요." });
            return;
        }

        if (!emailSent) {
            const ok = await sendEmail(email);
            if (ok) {
                setEmailSent(true);
                showAlert({ title: "인증번호 전송 완료", message: "이메일로 인증번호가 전송되었습니다." });
            }
        } else if (!isEmailVerified) {
            if (!code) {
                showAlert({ title: "알림", message: "인증번호를 입력해주세요." });
                return;
            }
            const ok = await verify(email, code);
            if (ok) {
                setIsEmailVerified(true);
                showAlert({ title: "인증 완료", message: "이메일 인증이 완료되었습니다." });
            } else {
                showAlert({ title: "인증 실패", message: "인증번호가 올바르지 않습니다." });
            }
        } else {
            showAlert({ title: "알림", message: "이미 이메일 인증이 완료되었습니다." });
        }
    };

    // 🔒 비밀번호 유효성 검사
    const handlePasswordChange = (text: string) => {
        setPassword(text);
        if (text.length > 0 && !PASSWORD_REGEX.test(text)) {
            setPasswordError("영문, 숫자 포함 10자 이상 입력해주세요.");
        } else {
            setPasswordError("");
        }
    };

    // 🔍 닉네임 중복 확인
    const handleCheckNickname = () => {
        checkNicknameVM(nickname);
    };

    // 🧾 회원가입 요청
    const handleSignup = async () => {
        if (!email || !password || !confirm || !nickname) {
            showAlert({ title: "알림", message: "모든 항목을 입력해주세요." });
            return;
        }
        if (!isEmailVerified) {
            showAlert({ title: "알림", message: "이메일 인증을 완료해주세요." });
            return;
        }
        if (passwordError) {
            showAlert({ title: "알림", message: "비밀번호 규칙을 확인해주세요." });
            return;
        }
        if (password !== confirm) {
            showAlert({ title: "알림", message: "비밀번호가 일치하지 않습니다." });
            return;
        }
        if (isNicknameAvailable !== true) {
            showAlert({ title: "알림", message: "닉네임 중복 확인을 해주세요." });
            return;
        }

        const ok = await signup({
            email,
            password,
            passwordConfirm: confirm,
            nickname,
        });

        if (ok) {
            showAlert({
                title: "회원가입 완료",
                message: `${nickname}님, 가입을 환영합니다!`,
                onConfirm: () => navigation.navigate("Login")
            });
        } else {
            showAlert({ title: "회원가입 실패", message: error || "오류가 발생했습니다." });
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <Header 
                title="회원가입" 
                showBackButton={true} 
                onBackPress={() => navigation.goBack()} 
            />

            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.container}>
                        <Image source={require("../../assets/logo.png")} style={styles.logo} />

                        {/* 이메일 */}
                        <TextInput
                            style={[styles.input, { marginBottom: 12 }]}
                            placeholder="이메일"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setEmailSent(false);
                                setIsEmailVerified(false);
                                setCode("");
                            }}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        {/* 인증번호 */}
                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginBottom: 0 }]} // marginBottom 제거 (row에서 처리)
                                placeholder="인증번호"
                                placeholderTextColor="#999"
                                value={code}
                                onChangeText={setCode}
                                keyboardType="number-pad"
                                editable={emailSent && !isEmailVerified}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.smallBtn,
                                    (isLoading || !email) && { opacity: 0.6 },
                                    isEmailVerified && { backgroundColor: "#ccc" },
                                ]}
                                onPress={handleEmailPress}
                                disabled={isLoading || !email || isEmailVerified}
                            >
                                <Text style={styles.smallBtnText}>
                                    {!emailSent ? "인증번호 전송" : isEmailVerified ? "인증 완료" : "확인"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* 비밀번호 */}
                        <TextInput
                            style={[
                                styles.input,
                                { marginBottom: passwordError ? 4 : 18 }, // 기본 마진 18
                                passwordError ? { borderColor: "red", borderWidth: 1 } : undefined,
                            ]}
                            placeholder="비밀번호 (영문, 숫자 포함 10자 이상)"
                            secureTextEntry
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={handlePasswordChange}
                        />
                        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                        {/* 비밀번호 확인 */}
                        <TextInput
                            style={[
                                styles.input,
                                { marginBottom: 18 },
                                confirm.length > 0 && password !== confirm && { borderColor: "red", borderWidth: 1 },
                            ]}
                            placeholder="비밀번호 확인"
                            secureTextEntry
                            placeholderTextColor="#999"
                            value={confirm}
                            onChangeText={setConfirm}
                        />
                        {confirm.length > 0 && password !== confirm && (
                            <Text style={styles.errorText}>비밀번호가 일치하지 않습니다.</Text>
                        )}

                        {/* 닉네임 */}
                        <View style={styles.row}>
                            <TextInput
                                style={[
                                    styles.input,
                                    { flex: 1, marginBottom: 0 },
                                    isNicknameAvailable === true && { borderColor: "blue", borderWidth: 1 },
                                    isNicknameAvailable === false && { borderColor: "red", borderWidth: 1 },
                                ]}
                                placeholder="닉네임"
                                placeholderTextColor="#999"
                                value={nickname}
                                onChangeText={(text) => {
                                    setNickname(text);
                                    setIsAvailable(null); // ViewModel 초기화 호출
                                }}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.smallBtn,
                                    (nicknameLoading || !nickname) && { opacity: 0.6 },
                                    isNicknameAvailable === true && { backgroundColor: "#ccc" }
                                ]}
                                onPress={handleCheckNickname}
                                disabled={nicknameLoading || !nickname || isNicknameAvailable === true}
                            >
                                {nicknameLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.smallBtnText}>
                                        {isNicknameAvailable === true ? "사용 가능" : "중복 확인"}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {isNicknameAvailable === false && (
                            <Text style={[styles.errorText, { alignSelf: 'flex-start', marginBottom: 10 }]}>
                                이미 사용 중인 닉네임입니다.
                            </Text>
                        )}

                        {/* 회원가입 버튼 */}
                        <TouchableOpacity
                            style={[
                                styles.signupBtn,
                                (isLoading || !isEmailVerified || isNicknameAvailable !== true) && { opacity: 0.6 },
                            ]}
                            onPress={handleSignup}
                            disabled={isLoading}
                        >
                            <Text style={styles.signupText}>
                                {signupLoading ? "처리 중..." : "회원가입"}
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.bottomText}>
                            이미 회원이신가요?{" "}
                            <Text
                                style={styles.link}
                                onPress={() => navigation.navigate("Login")}
                            >
                                로그인하기
                            </Text>
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#fff" },
    scrollContent: {
        flexGrow: 1,
    },
    container: {
        backgroundColor: "#fff",
        alignItems: "center",
        paddingHorizontal: 40, // 36에서 40으로 확대
        paddingBottom: 40,
        paddingTop: 30, // LoginScreen과 통일
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#000",
        marginBottom: 12,
    },
    logo: {
        width: 140,
        height: 140,
        resizeMode: "contain",
        marginBottom: 40,
    },
    row: {
        flexDirection: "row",
        width: "100%",
        alignItems: "center",
        marginBottom: 18,
    },
    input: {
        backgroundColor: "#F6F6F6",
        borderRadius: 12,
        height: 50,
        paddingHorizontal: 16,
        fontSize: 15,
        width: "100%",
        color: "#000",
        // marginBottom은 컴포넌트에서 직접 제어 또는 여기서는 기본값 제거
    },
    smallBtn: {
        backgroundColor: ORANGE,
        borderRadius: 12,
        height: 50,
        paddingHorizontal: 16,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
    },
    smallBtnText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 13,
    },
    signupBtn: {
        backgroundColor: ORANGE,
        width: "100%",
        height: 50,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    signupText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    bottomText: {
        fontSize: 13,
        color: "#999",
        marginTop: 24,
    },
    link: { color: ORANGE, fontWeight: "600" },
    errorText: {
        color: "red",
        fontSize: 12,
        width: "100%",
        marginBottom: 10,
        marginTop: -8,
        paddingLeft: 4,
    },
});