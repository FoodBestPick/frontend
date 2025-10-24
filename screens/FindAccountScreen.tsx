import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';

const { width, height } = Dimensions.get('window');
const ORANGE = '#FFA847';

export default function FindAccountScreen() {
    return (
        <View style={styles.container}>
            {/* 제목 */}
            <Text style={styles.title}>계정 찾기</Text>

            {/* 로고 */}
            <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
            />

            {/* 이메일 */}
            <TextInput
                placeholder="이메일"
                placeholderTextColor="#999"
                style={styles.input}
            />

            {/* 인증번호 + 버튼 */}
            <View style={styles.row}>
                <TextInput
                    placeholder="인증번호"
                    placeholderTextColor="#999"
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                />
                <TouchableOpacity style={styles.verifyButton}>
                    <Text style={styles.verifyText}>인증번호 전송</Text>
                </TouchableOpacity>
            </View>

            {/* 비밀번호 */}
            <TextInput
                placeholder="비밀번호"
                placeholderTextColor="#999"
                secureTextEntry
                style={styles.input}
            />

            {/* 비밀번호 확인 */}
            <TextInput
                placeholder="비밀번호 확인"
                placeholderTextColor="#999"
                secureTextEntry
                style={styles.input}
            />

            {/* 비밀번호 초기화 버튼 */}
            <TouchableOpacity style={styles.submitButton}>
                <Text style={styles.submitText}>비밀번호 초기화</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingTop: height * 0.08, // 로고 비율 조정 반영
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        marginBottom: 16,
    },
    logo: {
        width: 200, // 고정 크기 (피그마 기준)
        height: 200,
        resizeMode: 'contain',
        marginBottom: 22,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        width: width * 0.85,
        marginBottom: 14,
    },
    input: {
        backgroundColor: '#f5f5f5',
        width: width * 0.85,
        height: 50,
        borderRadius: 8,
        paddingHorizontal: 14,
        fontSize: 14,
        color: '#000',
        marginBottom: 14,
    },
    verifyButton: {
        backgroundColor: ORANGE,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 14,
        marginLeft: 8,
    },
    verifyText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 13,
    },
    submitButton: {
        backgroundColor: ORANGE,
        width: width * 0.85,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 18,
    },
    submitText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
});
