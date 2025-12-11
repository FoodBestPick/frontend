import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    StatusBar,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types/RootStackParamList";

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
            Alert.alert("알림", "이메일을 입력해주세요.");
            return;
        }

        if (!emailSent) {
            const ok = await sendEmail(email);
            if (ok) {
                setEmailSent(true);
                Alert.alert("인증번호 전송 완료", "이메일로 인증번호가 전송되었습니다.");
            }
        } else if (!isEmailVerified) {
            if (!code) {
                Alert.alert("알림", "인증번호를 입력해주세요.");
                return;
            }
            const ok = await verify(email, code);
            if (ok) {
                setIsEmailVerified(true);
                Alert.alert("인증 완료", "이메일 인증이 완료되었습니다.");
            } else {
                Alert.alert("인증 실패", "인증번호가 올바르지 않습니다.");
            }
        } else {
            Alert.alert("알림", "이미 이메일 인증이 완료되었습니다.");
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
            Alert.alert("알림", "모든 항목을 입력해주세요.");
            return;
        }
        if (!isEmailVerified) {
            Alert.alert("알림", "이메일 인증을 완료해주세요.");
            return;
        }
        if (passwordError) {
            Alert.alert("알림", "비밀번호 규칙을 확인해주세요.");
            return;
        }
        if (password !== confirm) {
            Alert.alert("알림", "비밀번호가 일치하지 않습니다.");
            return;
        }
        if (isNicknameAvailable !== true) {
            Alert.alert("알림", "닉네임 중복 확인을 해주세요.");
            return;
        }

        const ok = await signup({
            email,
            password,
            passwordConfirm: confirm,
            nickname,
        });

        if (ok) {
            Alert.alert("회원가입 완료", `${nickname}님, 가입을 환영합니다!`, [
                {
                    text: "확인",
                    onPress: () => navigation.navigate("Login"),
                },
            ]);
        } else {
            Alert.alert("회원가입 실패", error || "오류가 발생했습니다.");
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top + 10 }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={styles.container}>
                <Text style={styles.title}>회원가입</Text>
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
                        style={[styles.input, { flex: 1 }]}
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
                        { marginBottom: passwordError ? 4 : 12 },
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
                        { marginBottom: 12 },
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
                            { flex: 1 },
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#fff" },
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        paddingHorizontal: 28,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#000",
        marginBottom: 12,
    },
    logo: {
        width: 100,
        height: 100,
        resizeMode: "contain",
        marginBottom: 24,
    },
    row: {
        flexDirection: "row",
        width: "100%",
        alignItems: "center",
        marginBottom: 12,
    },
    input: {
        backgroundColor: "#F6F6F6",
        borderRadius: 10,
        height: 46,
        paddingHorizontal: 14,
        fontSize: 14,
        width: "100%",
    },
    smallBtn: {
        backgroundColor: ORANGE,
        borderRadius: 10,
        height: 46,
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
        borderRadius: 8,
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