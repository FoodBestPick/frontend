import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
const ORANGE = '#FFA847';

export default function SignupScreen() {
    const navigation = useNavigation<Navigation>();
    const insets = useSafeAreaInsets();

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [nickname, setNickname] = useState('');
    const [emailSent, setEmailSent] = useState(false);

    const handleEmailPress = () => {
        if (!email) return Alert.alert('알림', '이메일을 입력해주세요.');
        if (!emailSent) {
            Alert.alert('인증번호 전송 완료', '이메일로 인증번호가 전송되었습니다.');
            setEmailSent(true);
        } else {
            Alert.alert('인증 완료', '이메일 인증이 확인되었습니다.');
        }
    };

    const handleSignup = () => {
        if (!email || !password || !confirm || !nickname)
            return Alert.alert('알림', '모든 항목을 입력해주세요.');
        if (password !== confirm)
            return Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
        Alert.alert('회원가입 완료', `${nickname}님, 가입을 환영합니다!`);
        navigation.navigate('Login');
    };

    return (
        <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top + 10 }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={styles.container}>
                {/* 제목 */}
                <Text style={styles.title}>회원가입</Text>

                {/* 로고 */}
                <Image source={require('../../assets/logo.png')} style={styles.logo} />

                {/* 이메일 (단독 줄) */}
                <TextInput
                    style={[styles.input, { marginBottom: 12 }]}
                    placeholder="이메일"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                />

                {/* 인증번호 + 전송 버튼 */}
                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="인증번호"
                        placeholderTextColor="#999"
                        value={code}
                        onChangeText={setCode}
                    />
                    <TouchableOpacity style={styles.smallBtn} onPress={handleEmailPress}>
                        <Text style={styles.smallBtnText}>
                            {emailSent ? '확인' : '인증번호 전송'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* 비밀번호 */}
                <TextInput
                    style={[styles.input, { marginBottom: 12 }]}
                    placeholder="비밀번호"
                    secureTextEntry
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                />

                {/* 비밀번호 확인 */}
                <TextInput
                    style={[styles.input, { marginBottom: 12 }]}
                    placeholder="비밀번호 확인"
                    secureTextEntry
                    placeholderTextColor="#999"
                    value={confirm}
                    onChangeText={setConfirm}
                />

                {/* 닉네임 + 중복 확인 */}
                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="닉네임"
                        placeholderTextColor="#999"
                        value={nickname}
                        onChangeText={setNickname}
                    />
                    <TouchableOpacity style={styles.smallBtn}>
                        <Text style={styles.smallBtnText}>중복 확인</Text>
                    </TouchableOpacity>
                </View>

                {/* 회원가입 버튼 */}
                <TouchableOpacity style={styles.signupBtn} onPress={handleSignup}>
                    <Text style={styles.signupText}>회원가입</Text>
                </TouchableOpacity>

                {/* 하단 링크 */}
                <Text style={styles.bottomText}>
                    이미 회원이신가요?{' '}
                    <Text
                        style={styles.link}
                        onPress={() => navigation.navigate('Login')}
                    >
                        로그인하기
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
        backgroundColor: '#fff',
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
        marginBottom: 24,
    },
    row: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
    },
    input: {
        backgroundColor: '#F6F6F6',
        borderRadius: 10,
        height: 46,
        paddingHorizontal: 14,
        fontSize: 14,
        width: '100%',
    },
    smallBtn: {
        backgroundColor: ORANGE,
        borderRadius: 10,
        height: 46,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    smallBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
    signupBtn: {
        backgroundColor: ORANGE,
        width: '100%',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    signupText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    bottomText: {
        fontSize: 13,
        color: '#999',
        marginTop: 24,
    },
    link: { color: ORANGE, fontWeight: '600' },
});
