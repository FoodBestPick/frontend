import React, { useState, useLayoutEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDeleteAccountViewModel } from '../viewmodels/useDeleteAccountViewModel';

const DeleteAccountScreen = () => {
    const navigation = useNavigation();
    const { deleteAccount, isLoading } = useDeleteAccountViewModel();

    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    const DESTRUCTIVE_COLOR = '#E53935'; // 경고색 (빨강)

    // 헤더 설정
    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            title: '회원 탈퇴',
            headerBackTitleVisible: false,
            headerTintColor: '#000',
        });
    }, [navigation]);

    const handleSubmit = () => {
        // 최종 확인 얼럿
        Alert.alert(
            "정말 탈퇴하시겠습니까?",
            "탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.",
            [
                { text: "취소", style: "cancel" },
                {
                    text: "탈퇴하기",
                    style: "destructive",
                    onPress: () => deleteAccount(password, passwordConfirm)
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    <View style={styles.warningBox}>
                        <Text style={styles.warningTitle}>⚠️ 주의사항</Text>
                        <Text style={styles.warningText}>
                            회원 탈퇴 시 작성한 리뷰, 즐겨찾기 등 모든 활동 내역이 즉시 삭제됩니다.{'\n'}
                            삭제된 계정 정보는 복구할 수 없습니다.
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.label}>계정 비밀번호 확인</Text>

                        <TextInput
                            style={styles.input}
                            secureTextEntry
                            placeholder="비밀번호 입력"
                            value={password}
                            onChangeText={setPassword}
                            placeholderTextColor="#aaa"
                        />

                        <TextInput
                            style={styles.input}
                            secureTextEntry
                            placeholder="비밀번호 재입력"
                            value={passwordConfirm}
                            onChangeText={setPasswordConfirm}
                            placeholderTextColor="#aaa"
                        />

                        <TouchableOpacity
                            style={[
                                styles.button,
                                isLoading && styles.buttonDisabled
                            ]}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>회원 탈퇴</Text>
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

    warningBox: {
        backgroundColor: '#FFEBEE',
        padding: 16,
        borderRadius: 8,
        marginBottom: 30,
        marginTop: 10,
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#D32F2F',
        marginBottom: 8,
    },
    warningText: {
        fontSize: 14,
        color: '#D32F2F',
        lineHeight: 20,
    },

    formContainer: { gap: 16 },
    label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
        color: '#333'
    },

    button: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        backgroundColor: '#E53935', // 빨간색 버튼
    },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
});

export default DeleteAccountScreen;