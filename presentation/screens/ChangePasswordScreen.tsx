import React, { useState, useLayoutEffect } from 'react'; // useLayoutEffect 추가
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useChangePasswordViewModel } from '../viewmodels/useChangePasswordViewModel';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';

const ChangePasswordScreen = () => {
    const navigation = useNavigation();
    const { changePassword, isLoading, validatePassword } = useChangePasswordViewModel();
    const { logout } = useAuth();
    const { showAlert } = useAlert();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const MAIN_COLOR = '#FFA847';

    // ⭐ [추가됨] 화면 진입 시 헤더 옵션 설정 (App.tsx에서 옵션 제거함에 따른 조치)
    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,             // 이 화면만 헤더 보이기
            title: '비밀번호 변경',          // 타이틀
            headerBackTitleVisible: false, // 뒤로가기 옆 텍스트 숨김
            headerTintColor: '#000',       // 버튼 및 텍스트 색상
            headerStyle: {
                backgroundColor: '#fff',     // 헤더 배경색
            },
            headerTitleStyle: {
                fontWeight: 'bold',          // 타이틀 폰트
            },
        });
    }, [navigation]);

    const handleSubmit = async () => {
        const isSuccess = await changePassword(newPassword, confirmPassword);
        if (isSuccess) {
            showAlert({
                title: "성공",
                message: "비밀번호가 변경되었습니다.\n다시 로그인해주세요.",
                onConfirm: () => logout()
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <Text style={styles.headerTitle}>비밀번호 변경</Text>
                    <Text style={styles.subTitle}>
                        영문, 숫자 포함 10자리 이상 (특수문자 사용 가능)
                    </Text>

                    <View style={styles.formContainer}>
                        {/* 새 비밀번호 */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>새 비밀번호</Text>
                            <TextInput
                                style={styles.input}
                                secureTextEntry
                                placeholder="영문+숫자 포함 10자 이상"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholderTextColor="#aaa"
                                autoCapitalize="none"
                            />
                            {newPassword.length > 0 && !validatePassword(newPassword) && (
                                <Text style={styles.errorText}>
                                    영문과 숫자를 포함하여 10자 이상이어야 합니다.
                                </Text>
                            )}
                        </View>

                        {/* 새 비밀번호 확인 */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>새 비밀번호 확인</Text>
                            <TextInput
                                style={styles.input}
                                secureTextEntry
                                placeholder="새 비밀번호 다시 입력"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholderTextColor="#aaa"
                                autoCapitalize="none"
                            />
                            {newPassword !== '' && confirmPassword !== '' && newPassword !== confirmPassword && (
                                <Text style={styles.errorText}>비밀번호가 일치하지 않습니다.</Text>
                            )}
                        </View>

                        {/* 버튼 */}
                        <TouchableOpacity
                            style={[
                                styles.button,
                                { backgroundColor: MAIN_COLOR },
                                (isLoading || !validatePassword(newPassword)) && styles.buttonDisabled
                            ]}
                            onPress={handleSubmit}
                            disabled={isLoading || !validatePassword(newPassword)}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>변경하기</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { padding: 24 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 20, marginBottom: 8 },
    subTitle: { fontSize: 14, color: '#666', marginBottom: 40 },
    formContainer: { gap: 24 },
    inputGroup: { marginBottom: 4 },
    label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
    input: { height: 52, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 16, fontSize: 16, backgroundColor: '#FAFAFA', color: '#333' },
    errorText: { color: '#E53935', fontSize: 12, marginTop: 6, marginLeft: 4 },
    button: { height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 30, shadowColor: '#FFA847', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
    buttonDisabled: { opacity: 0.5, backgroundColor: '#ffb3a3' },
    buttonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
});

export default ChangePasswordScreen;