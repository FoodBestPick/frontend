import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
const ORANGE = '#FFA847';

const slides = [
    {
        id: 1,
        image: require('../../assets/onboard1.png'),
        title: '오늘 뭐 먹지?',
        desc: '무엇을 먹어야할지, 혼자 밥먹기 싫을 때\n오늘 뭐 먹지? 앱을 사용하면 간단하게 해결!',
    },
    {
        id: 2,
        image: require('../../assets/onboard2.png'),
        title: '근처 식당 추천',
        desc: '추천 메뉴를 판매하는 식당을\n지도에서 바로 찾아드려요.',
    },
    {
        id: 3,
        image: require('../../assets/onboard3.png'),
        title: '기분에 맞는 음식까지!',
        desc: '날씨, 기분, 시간대에 맞춘\nAI 맞춤 추천 기능 제공!',
    },
];

export default function OnboardingScreen() {
    const navigation = useNavigation<Navigation>();
    const [index, setIndex] = useState(0);

    // ✅ 버튼 눌렀을 때 동작
    const handleNext = () => {
        if (index < slides.length - 1) {
            setIndex((prev) => prev + 1);
        } else {
            navigation.navigate('Login');
        }
    };

    const current = slides[index];

    return (
        <View style={styles.container}>
            {/* 로고 */}
            <Image source={require('../../assets/logo.png')} style={styles.logo} />

            {/* 현재 슬라이드 이미지 */}
            <Image source={current.image} style={styles.image} />

            {/* 제목 및 설명 */}
            <Text style={styles.title}>{current.title}</Text>
            <Text style={styles.desc}>{current.desc}</Text>

            {/* 인디케이터 */}
            <View style={styles.dots}>
                {slides.map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            { opacity: i === index ? 1 : 0.3 },
                        ]}
                    />
                ))}
            </View>

            {/* 버튼 */}
            <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>
                    {index === slides.length - 1 ? '시작하기' : '확인하기'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
        marginBottom: 30,
    },
    image: {
        width: 230,
        height: 230,
        resizeMode: 'contain',
        marginBottom: 18,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        marginBottom: 6,
    },
    desc: {
        fontSize: 14,
        textAlign: 'center',
        color: '#555',
        lineHeight: 20,
    },
    dots: {
        flexDirection: 'row',
        marginTop: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: ORANGE,
        marginHorizontal: 4,
    },
    button: {
        position: 'absolute',
        bottom: 50,
        backgroundColor: ORANGE,
        paddingVertical: 14,
        paddingHorizontal: 80,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
});
