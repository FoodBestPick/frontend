import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useFindAccountViewModel } from "../viewmodels/useFindAccountViewModel";
import { Header } from "../components/Header";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAlert } from "../../context/AlertContext";

const { width, height } = Dimensions.get("window");
const ORANGE = "#FFA847";

export default function FindAccountScreen() {
    const navigation = useNavigation();
    const { showAlert } = useAlert();

    const [email, setEmail] = useState<string>("");
    const [code, setCode] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordConfirm, setPasswordConfirm] = useState<string>("");

    const {
        loading,
        emailSent,
        emailVerified,
        error,
        sendCode,
        verifyCode,
        resetPassword,
    } = useFindAccountViewModel(); // ⭐ 이제 any 에러 안 날 겁니다.

    // 1) 인증번호 전송 / 확인 버튼
    const handleEmailButtonPress = async () => {
        if (!email) {
            showAlert({ title: "알림", message: "이메일을 입력해주세요." });
            return;
        }

        if (!emailSent) {
            // 아직 안 보냈으면 → 인증번호 전송
            const ok = await sendCode(email);
            if (ok) showAlert({ title: "전송 완료", message: "인증번호가 전송되었습니다." });
            else showAlert({ title: "실패", message: error || "전송 실패" });
        } else {
            // 이미 전송된 상태 → 인증번호 확인
            if (emailVerified) {
                showAlert({ title: "알림", message: "이미 인증되었습니다." });
                return;
            }
            if (!code) {
                showAlert({ title: "알림", message: "인증번호를 입력해주세요." });
                return;
            }
            const ok = await verifyCode(email, code);
            if (ok) showAlert({ title: "인증 완료", message: "이메일 인증이 완료되었습니다." });
            else showAlert({ title: "실패", message: error || "인증번호가 틀렸습니다." });
        }
    };

    // 2) 비밀번호 초기화 버튼
    const handleResetPassword = async () => {
        if (!emailVerified) {
            showAlert({ title: "알림", message: "이메일 인증을 먼저 완료해주세요." });
            return;
        }
        if (!password || !passwordConfirm) {
            showAlert({ title: "알림", message: "새 비밀번호를 입력해주세요." });
            return;
        }
        if (password !== passwordConfirm) {
            showAlert({ title: "알림", message: "비밀번호가 일치하지 않습니다." });
            return;
        }

        // ⭐ [수정] ViewModel에 code도 같이 넘겨야 합니다! (기존 코드엔 빠져있었음)
        const ok = await resetPassword(email, code, password, passwordConfirm);

        if (ok) {
            showAlert({
                title: "완료",
                message: "비밀번호가 변경되었습니다.",
                onConfirm: () => navigation.goBack()
            });
        } else {
            showAlert({ title: "실패", message: error || "비밀번호 변경 실패" });
        }
    };

    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={['bottom', 'left', 'right']}>
            <Header 
                title="계정 찾기" 
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
                        <Image
                            source={require("../../assets/logo.png")}
                            style={styles.logo}
                        />

                        {/* 이메일 */}
                        <TextInput
                            placeholder="이메일"
                            placeholderTextColor="#999"
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            editable={!emailSent} 
                        />

                        {/* 인증번호 + 버튼 */}
                        <View style={styles.row}>
                            <TextInput
                                placeholder="인증번호"
                                placeholderTextColor="#999"
                                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                value={code}
                                onChangeText={setCode}
                                keyboardType="number-pad"
                                editable={emailSent && !emailVerified}
                            />
                            <TouchableOpacity
                                style={[styles.verifyButton, emailVerified && { backgroundColor: "#ccc" }]}
                                onPress={handleEmailButtonPress}
                                disabled={loading || emailVerified}
                            >
                                <Text style={styles.verifyText}>
                                    {!emailSent ? "인증번호 전송" : emailVerified ? "인증 완료" : "확인"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* 비밀번호 */}
                        <TextInput
                            placeholder="새 비밀번호"
                            placeholderTextColor="#999"
                            secureTextEntry
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                        />

                        {/* 비밀번호 확인 */}
                        <TextInput
                            placeholder="새 비밀번호 확인"
                            placeholderTextColor="#999"
                            secureTextEntry
                            style={styles.input}
                            value={passwordConfirm}
                            onChangeText={setPasswordConfirm}
                        />

                        {/* 비밀번호 초기화 버튼 */}
                        <TouchableOpacity
                            style={[styles.submitButton, (!emailVerified || loading) && { opacity: 0.6 }]}
                            onPress={handleResetPassword}
                            disabled={loading || !emailVerified}
                        >
                            <Text style={styles.submitText}>
                                {loading ? "처리 중..." : "비밀번호 초기화"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
    },
    container: {
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
        alignItems: "center",
        width: "100%", // width * 0.85 대신 100% 사용 (paddingHorizontal로 제어)
        marginBottom: 18, // LoginScreen과 통일
    },
    input: {
        backgroundColor: "#f5f5f5",
        width: "100%", // width * 0.85 대신 100%
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 15,
        color: "#000",
        marginBottom: 18,
    },
    verifyButton: {
        backgroundColor: ORANGE,
        height: 50,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 14,
        marginLeft: 8,
    },
    verifyText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 13,
    },
    submitButton: {
        backgroundColor: ORANGE,
        width: "100%",
        height: 50,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 18,
    },
    submitText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },
});