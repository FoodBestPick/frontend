import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';

const MAIN_COLOR = '#FFA847';

const MatchingFindingScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    // 이전 화면(Setup)에서 받은 조건
    const { food, size } = route.params;
    const [statusText, setStatusText] = useState("주변 파트너를 찾는 중...");

    useEffect(() => {
        // 1. 매칭 시뮬레이션 (멘트 변경)
        setTimeout(() => {
            setStatusText(`'${food}' 파티 매칭 시도 중...`);
        }, 1500);

        // 2. 매칭 성공 시 채팅방으로 이동 (3초 후)
        const timer = setTimeout(() => {
            // 🔥 [핵심] 뒤로가기 막기 위해 스택을 재설정 (Home -> ChatRoom)
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [
                        { name: 'UserMain' }, // 뒤로가기 누르면 홈으로
                        {
                            name: 'ChatRoomScreen',
                            params: {
                                roomTitle: `${food} 함께 먹어요!`,
                                peopleCount: size === 0 ? 4 : size
                            }
                        },
                    ],
                })
            );
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <Icon name="search" size={50} color="#FFF" />
                </View>
                <ActivityIndicator size="large" color={MAIN_COLOR} style={{ marginTop: 30 }} />
                <Text style={styles.title}>{statusText}</Text>
                <Text style={styles.subtitle}>
                    {size === 0 ? '인원 무관' : `${size}명`} / {food}
                </Text>
                <Text style={styles.tipText}>매칭이 완료되면 즉시 채팅방이 열립니다.</Text>
            </View>
        </SafeAreaView>
    );
};

export default MatchingFindingScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
    iconCircle: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: MAIN_COLOR,
        justifyContent: 'center', alignItems: 'center',
        elevation: 10, shadowColor: MAIN_COLOR, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10,
    },
    title: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 20, textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#888', marginTop: 10, fontWeight: '500' },
    tipText: { fontSize: 13, color: '#999', marginTop: 40 },
});