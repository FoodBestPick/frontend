import React, { useRef } from 'react';
import { TouchableOpacity, StyleSheet, View, PanResponder, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';

const MAIN_COLOR = '#FFA847';
const { width, height } = Dimensions.get('window');

interface Props {
    currentRouteName: string;
    navigationRef: any;
}

export const FloatingChatButton = ({ currentRouteName, navigationRef }: Props) => {
    const { activeRoomId } = useAuth();

    // 초기 위치 (우측 하단)
    const pan = useRef(new Animated.ValueXY({ x: width - 80, y: height - 150 })).current;

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // 클릭인지 드래그인지 구분 (약간의 움직임 허용)
                return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
            },
            onPanResponderGrant: () => {
                pan.setOffset({
                    x: (pan.x as any)._value,
                    y: (pan.y as any)._value
                });
                pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: () => {
                pan.flattenOffset();
            }
        })
    ).current;

    // 1. 방이 없으면 안 보임
    if (!activeRoomId) return null;

    // 2. 이미 채팅방 화면이면 안 보임
    if (currentRouteName === 'ChatRoomScreen') return null;

    // 3. 네비게이션 준비 안됐으면 안 보임
    if (!navigationRef || !navigationRef.isReady()) return null;

    return (
        <Animated.View
            style={[
                styles.fabContainer,
                { transform: [{ translateX: pan.x }, { translateY: pan.y }] }
            ]}
            {...panResponder.panHandlers}
        >
            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.9}
                onPress={() => {
                    navigationRef.navigate('ChatRoomScreen', {
                        roomId: activeRoomId,
                        roomTitle: '진행 중인 채팅방', 
                        peopleCount: 0 
                    });
                }}
            >
                <View style={styles.iconContainer}>
                    <Icon name="chatbubbles" size={28} color="#fff" />
                    <View style={styles.badge} />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    fabContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 9999, 
    },
    fab: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: MAIN_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    iconContainer: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FF3B30',
        borderWidth: 2,
        borderColor: MAIN_COLOR,
    },
});
