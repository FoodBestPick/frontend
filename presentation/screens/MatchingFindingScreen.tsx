import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    StatusBar,
    PermissionsAndroid,
    Platform,
    TouchableOpacity,
    Alert
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { useMatchingViewModel } from "../viewmodels/MatchingViewModel";

const MAIN_COLOR = '#FFA847';

const safeGetLocation = () =>
    new Promise<{ lat: number; lng: number }>((resolve, reject) => {
        try {
            Geolocation.getCurrentPosition(
                (pos) => {
                    if (!pos || !pos.coords) return reject("coords is null");
                    resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                (error) => {
                    console.log("GPS ERROR:", error);
                    reject(error);
                },
                {
                    enableHighAccuracy: false,
                    timeout: 30000,
                    maximumAge: 10000,
                }
            );
        } catch (e) {
            console.log("NATIVE GPS CRASH:", e);
            reject(e);
        }
    });

const MatchingFindingScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { food, size } = route.params;

    const { isMatched, roomId, statusText, requestMatch, cancelMatch } = useMatchingViewModel();

    const matchedRef = useRef(false);
    const navigatedRef = useRef(false);

    const startedRef = useRef(false);

    useEffect(() => {
        matchedRef.current = isMatched;
    }, [isMatched]);

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
<<<<<<< Updated upstream
            try {
                console.log("[Matching] 안드로이드 위치 권한 요청 시작");
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                ]);

                if (granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED &&
                    granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log("[Matching] 위치 권한 모두 허용됨");
                    return true;
                } else {
                    console.log("[Matching] 위치 권한 거부됨");
                    return false;
=======
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: "위치 권한 요청",
                    message: "매칭을 위해 현재 위치 정보가 필요합니다.",
                    buttonPositive: "확인",
>>>>>>> Stashed changes
                }
            } catch (err) {
                console.error('위치 권한 요청 에러:', err);
                return false;
            }
        }
        return true; // iOS는 Manifest에서 처리
    };
    
    useEffect(() => {
<<<<<<< Updated upstream
        let mounted = true; // 메모리 누수 방지

        async function init() {
            try {
                const hasPermission = await requestLocationPermission();
                if (!hasPermission) {
                    if (mounted) {
                        Alert.alert("알림", "위치 권한이 거부되어 매칭을 진행할 수 없습니다.", [{ text: "확인", onPress: () => navigation.goBack() }]);
                    }
                    return;
                }
                
                console.log("[Matching] Geolocation.getCurrentPosition 호출 시작");
                Geolocation.getCurrentPosition(
                    (pos) => {
                        if (!mounted) return;
                        const lat = pos.coords.latitude;
                        const lng = pos.coords.longitude;
                        console.log(`[Matching] 위치 확보: 위도 ${lat}, 경도 ${lng}`);
                        
                        // 위치 확보 성공 시 매칭 요청
                        requestMatch(food, size, lat, lng);
                    },
                    (error) => {
                        console.error("[Matching] 위치 오류 발생:", error.code, error.message);
                        if (mounted) {
                            let errorMessage = "현재 위치를 가져올 수 없습니다. GPS 설정과 권한을 확인해주세요.";
                            if (error.code === 1) errorMessage = "위치 권한이 없습니다.";
                            else if (error.code === 2) errorMessage = "GPS가 꺼져있거나 기기에서 위치를 가져올 수 없습니다.";
                            else if (error.code === 3) errorMessage = "위치 요청 시간 초과.";

                            Alert.alert("오류", errorMessage, [{ text: "확인", onPress: () => navigation.goBack() }]);
                        }
                    },
                    {
                        enableHighAccuracy: true, // 다시 고정밀도 활성화
                        timeout: 15000,
                        maximumAge: 10000
                    }
                );
            } catch (e) {
                console.error("[Matching] 초기화 중 치명적 에러:", e);
                if (mounted) {
                    Alert.alert("오류", "매칭 초기화 중 문제가 발생했습니다.", [{ text: "확인", onPress: () => navigation.goBack() }]);
                }
            }
        }

        init();

        return () => { 
            mounted = false; 
            cancelMatch(); // 컴포넌트 언마운트 시 매칭 취소 요청
        };
    }, []);

    useEffect(() => {
        if (isMatched && roomId) {
            // 🔥 매칭 성공 시 채팅방으로 화면 교체 (뒤로가기 시 다시 매칭 화면으로 오지 않도록)
            navigation.replace('ChatRoomScreen', {
                roomId,
                roomTitle: `${food} 함께 먹어요!`,
                peopleCount: size === 0 ? 4 : size
            });
=======
        if (startedRef.current) return;
        startedRef.current = true;

        (async () => {
            const hasPermission = await requestLocationPermission();

            if (!hasPermission) {
                Alert.alert("위치 권한 필요", "위치 권한이 없으면 매칭이 불가능합니다.");
                navigation.goBack();
                return;
            }

            try {
                const { lat, lng } = await safeGetLocation();
                console.log("현재 위치:", lat, lng);
                await requestMatch(food, size, lat, lng);
            } catch (e) {
                console.log("위치 가져오기 실패:", e);
                Alert.alert("위치 오류", "현재 위치를 가져올 수 없습니다.\n잠시 후 다시 시도해주세요.");
                navigation.goBack();
            }
        })();
    }, [food, size, navigation]);

    useEffect(() => {
        return () => {
            if (!matchedRef.current) {
                cancelMatch();
            }
        };
    }, [cancelMatch]);

    useEffect(() => {
        if (navigatedRef.current) return;

        if (isMatched && roomId != null) {
            navigatedRef.current = true;

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
                                peopleCount: size === 0 ? 4 : size,
                            },
                        },
                    ],
                })
            );
>>>>>>> Stashed changes
        }
    }, [isMatched, roomId, navigation, food, size]);

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

                <Text style={styles.tipText}>
                    매칭이 완료되면 즉시 채팅방이 열립니다.
                </Text>
            </View>

            <TouchableOpacity
                style={styles.cancelButton}
                disabled={isMatched}
                onPress={async () => {
                    if (isMatched) {
                        Alert.alert("알림", "매칭이 완료되어 채팅방으로 이동합니다.");
                        return;
                    }

                    await cancelMatch();
                    startedRef.current = false;
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
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: MAIN_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: MAIN_COLOR,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        marginTop: 10,
        fontWeight: '500',
    },
    tipText: {
        fontSize: 13,
        color: '#999',
        marginTop: 40,
    },
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
