import React, { useState, useEffect } from 'react';
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
import { RootStackParamList } from "../navigation/types/RootStackParamList";
import { LoginKakaoViewModels } from '../viewmodels/LoginKakaoViewModels';
import { useLoginGoogleViewModel } from '../viewmodels/LoginGoogleViewModels';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import NaverLogin from "@react-native-seoul/naver-login";
import { useLoginNaverViewModels } from "../viewmodels/LoginNaverViewModels";
import { GOOGLE_WEB_CLIENT_ID, NAVER_APP_NAME, NAVER_CLIENT_ID, NAVER_CLIENT_SECRET } from "@env";

type Navigation = NativeStackNavigationProp<RootStackParamList>;
const ORANGE = '#FFA847';

export default function LoginScreen() {
    const navigation = useNavigation<Navigation>();
    const insets = useSafeAreaInsets();
    const viewModel = new LoginKakaoViewModels();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [saveEmail, setSaveEmail] = useState(false);
    const [autoLogin, setAutoLogin] = useState(false);

    const { loginGoogle } = useLoginGoogleViewModel();
    const { login: loginNaver } = useLoginNaverViewModels();

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: `${GOOGLE_WEB_CLIENT_ID}`,
            offlineAccess: true,
        });
    }, []);

    useEffect(() => {
        NaverLogin.initialize({
            appName: NAVER_APP_NAME,
            consumerKey: NAVER_CLIENT_ID,
            consumerSecret: NAVER_CLIENT_SECRET,
            serviceUrlSchemeIOS: "naverlogin",
            disableNaverAppAuthIOS: true,
        });
    }, []);


    /* 일반 로그인 */
    const handleLogin = () => {
        if (email === "user@example.com" && password === "1234") {
            navigation.reset({
                index: 0,
                routes: [{ name: "UserMain" }],
            });
        } else if (email === "admin@example.com" && password === "1234") {
            navigation.reset({
                index: 0,
                routes: [{ name: "AdminMain" }],
            });
        } else {
            Alert.alert("로그인 실패", "아이디 또는 비밀번호를 확인하세요.");
        }
    };

    /* 구글 로그인 */
    const handleGoogleLogin = async () => {
        try {
            const result = await GoogleSignin.signIn();

            const idToken = result.data?.idToken;
            if (!idToken) {
                Alert.alert("구글 로그인 실패", "ID Token 없음");
                return;
            }

            await loginGoogle(idToken);

            navigation.reset({
                index: 0,
                routes: [{ name: "UserMain" }],
            });

        } catch (error) {
            Alert.alert("구글 로그인 실패");
        }
    };

        /* 네이버 로그인 */
    const handleNaverLogin = async () => {
        try {
            navigation.reset({
                index: 0,
                routes: [{ name: "UserMain" }],
            });

        } catch (e) {
            Alert.alert("네이버 로그인 실패");
        }
    };

    /* 카카오 로그인 */
    const handleKakaoLogin = async () => {
        try {
            await viewModel.loginWithKakao();

            navigation.reset({
                index: 0,
                routes: [{ name: "UserMain" }],
            });

        } catch {
            Alert.alert("카카오 로그인 실패");
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top + 10 }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <View style={styles.container}>

                <Text style={styles.title}>로그인</Text>

                <Image source={require('../../assets/logo.png')} style={styles.logo} />

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

                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginText}>로그인</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.navigate('FindAccount')}
                    style={styles.findContainer}>
                    <Text style={styles.findText}>계정 찾기</Text>
                </TouchableOpacity>

                <View style={styles.socialIcons}>

                    {/* 카카오 */}
                    <TouchableOpacity
                        style={[styles.socialCircle, { backgroundColor: '#FEE500' }]}
                        onPress={handleKakaoLogin}
                    >
                        <Image
                            source={require("../../assets/kakao.png")}
                            style={{ width: 24, height: 24, alignSelf: "center", marginTop: 8 }}
                        />
                    </TouchableOpacity>

                    {/* 구글 */}
                    <TouchableOpacity
                        style={[styles.socialCircle, { backgroundColor: '#fff' }]}
                        onPress={handleGoogleLogin}
                    >
                        <Image
                            source={require("../../assets/google.png")}
                            style={{ width: 24, height: 24, alignSelf: "center", marginTop: 8 }}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.socialCircle, { backgroundColor: '#03C75A' }]}
                        onPress={handleNaverLogin}
                    >
                        <Image
                            source={require("../../assets/naver.png")}
                            style={{ width: 24, height: 24, alignSelf: "center", marginTop: 8 }}
                        />
                    </TouchableOpacity>
                    <View style={styles.socialCircle}></View>
                </View>

                <Text style={styles.bottomText}>
                    아직 회원이 아니신가요?{' '}
                    <Text
                        style={styles.link}
                        onPress={() => navigation.navigate('SignUp')}>
                        회원가입하기
                    </Text>
                </Text>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1, alignItems: 'center', paddingHorizontal: 28 },
    title: { fontSize: 22, fontWeight: '700', color: '#000', marginBottom: 12 },
    logo: { width: 100, height: 100, resizeMode: 'contain', marginBottom: 24 },
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
    findContainer: { width: '100%', alignItems: 'flex-end', marginTop: 10 },
    findText: { color: '#999', fontSize: 13 },
    socialIcons: { flexDirection: 'row', justifyContent: 'center' },
    socialCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#eee',
        marginHorizontal: 8,
    },
    bottomText: { fontSize: 13, color: '#999', marginTop: 35 },
    link: { color: ORANGE, fontWeight: '600' },
});
