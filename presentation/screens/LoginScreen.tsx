import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    TextInput,
    Image,
    StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import CheckBox from '@react-native-community/checkbox';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from "../navigation/types/RootStackParamList"

type Navigation = NativeStackNavigationProp<RootStackParamList>;
const ORANGE = '#FFA847';

export default function LoginScreen() {
    const navigation = useNavigation<Navigation>();
    const insets = useSafeAreaInsets();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [saveEmail, setSaveEmail] = useState(false);
    const [autoLogin, setAutoLogin] = useState(false);

    const handleLogin = () => {
        if (email === "admin@example.com" && password === "1234") {
            navigation.reset({
                index: 0,
                routes: [{ name: "AdminMain" }],
            });
        } else if(email === "user@example.com" && password == "1234") {
            /*navigation.reset({
                index : 0
                routes: [{ name: "UserMain" }],
            });*/
        } else {
            Alert.alert("로그인 실패", "아이디 또는 비밀번호를 확인하세요.");
        }
    };
    return (
        <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top + 10 }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={styles.container}>

                {/* ✅ 제목 먼저 */}
                <Text style={styles.title}>로그인</Text>

                {/* ✅ 제목 아래 로고 */}
                <Image source={require('../../assets/logo.png')} style={styles.logo} />

                {/* 입력창 */}
                <TextInput
                    style={styles.input}
                    placeholder="이메일 입력"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={styles.input}
                    placeholder="비밀번호 입력"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                {/* 체크박스 */}
                <View style={styles.checkboxRow}>
                    <View style={styles.checkboxContainer}>
                        <CheckBox
                            value={saveEmail}
                            onValueChange={setSaveEmail}
                            tintColors={{ true: ORANGE, false: '#999' }}
                        />
                        <Text style={styles.checkboxLabel}>이메일 저장</Text>
                    </View>
                    <View style={styles.checkboxContainer}>
                        <CheckBox
                            value={autoLogin}
                            onValueChange={setAutoLogin}
                            tintColors={{ true: ORANGE, false: '#999' }}
                        />
                        <Text style={styles.checkboxLabel}>자동 로그인</Text>
                    </View>
                </View>

                {/* 로그인 버튼 */}
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginText}>로그인</Text>
                </TouchableOpacity>

                {/* 계정 찾기 */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('FindAccount')}
                    style={styles.findContainer}
                >
                    <Text style={styles.findText}>계정 찾기</Text>
                </TouchableOpacity>

                {/* 소셜 로그인 */}
                <View style={styles.socialContainer}>
                    <Text style={styles.socialText}>소셜로그인</Text>
                    <View style={styles.socialIcons}>
                        <View style={styles.socialCircle} />
                        <View style={styles.socialCircle} />
                        <View style={styles.socialCircle} />
                        <View style={styles.socialCircle} />
                    </View>
                </View>

                {/* 하단 회원가입 문구 */}
                <Text style={styles.bottomText}>
                    아직 회원이 아니신가요?{' '}
                    <Text
                        style={styles.link}
                        onPress={() => navigation.navigate('SignUp')}
                    >
                        회원가입하기
                    </Text>
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 28,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        marginBottom: 12,
    },
    logo: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
        marginBottom: 24, // 제목과 입력창 사이 여백
    },
    input: {
        width: '100%',
        height: 46,
        backgroundColor: '#F6F6F6',
        borderRadius: 10,
        paddingHorizontal: 14,
        fontSize: 14,
        marginBottom: 14,
    },
    checkboxRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center' },
    checkboxLabel: { fontSize: 13, color: '#333' },
    loginButton: {
        backgroundColor: ORANGE,
        width: '100%',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    loginText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    findContainer: {
        width: '100%',
        alignItems: 'flex-end',
        marginTop: 10,
    },
    findText: { color: '#999', fontSize: 13 },
    socialContainer: { alignItems: 'center', marginTop: 40 },
    socialText: { fontSize: 13, color: '#666', marginBottom: 10 },
    socialIcons: { flexDirection: 'row', justifyContent: 'center' },
    socialCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#eee',
        marginHorizontal: 8,
    },
    bottomText: {
        fontSize: 13,
        color: '#999',
        marginTop: 35,
    },
    link: {
        color: ORANGE,
        fontWeight: '600',
    },
});
