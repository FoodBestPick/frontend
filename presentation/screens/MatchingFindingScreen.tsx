import React, { useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ActivityIndicator, 
    StatusBar, 
    PermissionsAndroid, 
    Platform,
    TouchableOpacity
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { useMatchingViewModel } from "../viewmodels/MatchingViewModel";

const MAIN_COLOR = '#FFA847';

const MatchingFindingScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const { food, size } = route.params;

    const { 
        isMatched,
        roomId,
        statusText,
        requestMatch,
        cancelMatch
    } = useMatchingViewModel();

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: "위치 권한 요청",
                    message: "매칭을 위해 현재 위치 정보가 필요합니다.",
                    buttonPositive: "확인"
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
    };

    useEffect(() => {
        async function init() {
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) {
                console.log("위치 권한 없음");
                return;
            }

            Geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;

                    requestMatch(food, size, lat, lng);
                },
                (error) => {
                    console.log("위치 오류:", error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 10000
                }
            );
        }

        init();
    }, []);

    useEffect(() => {
        if (isMatched && roomId) {
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [
                        { name: 'UserMain' },
                        {
                            name: 'ChatRoomScreen',
                            params: {
                                roomId,
                                roomTitle: `${food} 함께 먹어요!`,
                                peopleCount: size === 0 ? 4 : size
                            }
                        },
                    ],
                })
            );
        }
    }, [isMatched]);

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

            <TouchableOpacity
                style={styles.cancelButton}
                onPress={async () => {
                    await cancelMatch();
                    navigation.goBack(); 
                }}
            >
                <Text style={styles.cancelButtonText}>매칭 취소</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default MatchingFindingScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },

    content: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        paddingHorizontal: 30 
    },

    iconCircle: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: MAIN_COLOR,
        justifyContent: 'center', alignItems: 'center',
        elevation: 10, shadowColor: MAIN_COLOR, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10,
    },

    title: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 20, textAlign: 'center' },

    subtitle: { fontSize: 16, color: '#888', marginTop: 10, fontWeight: '500' },

    tipText: { fontSize: 13, color: '#999', marginTop: 40 },

    cancelButton: {
        position: 'absolute',
        bottom: 35,
        alignSelf: 'center',
        backgroundColor: '#E0E0E0',
        paddingHorizontal: 22,
        paddingVertical: 12,
        borderRadius: 10,
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: '700',
        fontSize: 15,
    },
});
