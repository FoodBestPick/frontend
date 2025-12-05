import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image,
    Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useFindAccountViewModel } from "../viewmodels/useFindAccountViewModel";

const { width, height } = Dimensions.get("window");
const ORANGE = "#FFA847";

export default function FindAccountScreen() {
    const navigation = useNavigation();

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
            Alert.alert("알림", "이메일을 입력해주세요.");
            return;
        }

        if (!emailSent) {
            // 아직 안 보냈으면 → 인증번호 전송
            const ok = await sendCode(email);
            if (ok) Alert.alert("전송 완료", "인증번호가 전송되었습니다.");
            else Alert.alert("실패", error || "전송 실패");
        } else {
            // 이미 전송된 상태 → 인증번호 확인
            if (emailVerified) {
                Alert.alert("알림", "이미 인증되었습니다.");
                return;
            }
            if (!code) {
                Alert.alert("알림", "인증번호를 입력해주세요.");
                return;
            }
            const ok = await verifyCode(email, code);
            if (ok) Alert.alert("인증 완료", "이메일 인증이 완료되었습니다.");
            else Alert.alert("실패", error || "인증번호가 틀렸습니다.");
        }
    };

    // 2) 비밀번호 초기화 버튼
    const handleResetPassword = async () => {
        if (!emailVerified) {
            Alert.alert("알림", "이메일 인증을 먼저 완료해주세요.");
            return;
        }
        if (!password || !passwordConfirm) {
            Alert.alert("알림", "새 비밀번호를 입력해주세요.");
            return;
        }
        if (password !== passwordConfirm) {
            Alert.alert("알림", "비밀번호가 일치하지 않습니다.");
            return;
        }

        // ⭐ [수정] ViewModel에 code도 같이 넘겨야 합니다! (기존 코드엔 빠져있었음)
        const ok = await resetPassword(email, code, password, passwordConfirm);

        if (ok) {
            Alert.alert("완료", "비밀번호가 변경되었습니다.", [
                { text: "로그인하러 가기", onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert("실패", error || "비밀번호 변경 실패");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>계정 찾기</Text>

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
                editable={!emailSent} // 전송 후엔 수정 막기
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        paddingTop: height * 0.08,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#000",
        marginBottom: 16,
    },
    logo: {
        width: 200,
        height: 200,
        resizeMode: "contain",
        marginBottom: 22,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        width: width * 0.85,
        marginBottom: 14,
    },
    input: {
        backgroundColor: "#f5f5f5",
        width: width * 0.85,
        height: 50,
        borderRadius: 8,
        paddingHorizontal: 14,
        fontSize: 14,
        color: "#000",
        marginBottom: 14,
    },
    verifyButton: {
        backgroundColor: ORANGE,
        height: 50,
        borderRadius: 8,
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
        width: width * 0.85,
        height: 50,
        borderRadius: 8,
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