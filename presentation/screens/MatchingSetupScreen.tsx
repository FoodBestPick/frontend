import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions, FlatList, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const MAIN_COLOR = '#FFA847';

const FOOD_CATEGORIES = [
    { name: '랜덤', icon: 'shuffle-outline' },
    { name: '한식', icon: 'rice-bowl-outline' },
    { name: '중식', icon: 'cube-outline' },
    { name: '일식', icon: 'fish-outline' },
    { name: '양식', icon: 'pizza-outline' },
    { name: '분식', icon: 'ice-cream-outline' },
    { name: '퓨전', icon: 'sparkles-outline' },
    { name: '카페', icon: 'cafe-outline' },
    { name: '패스트푸드', icon: 'burger-outline' },
    { name: '아시안', icon: 'restaurant-outline' },
];

const ITEM_WIDTH = (width - 32) / 5;

// 🔥 [수정] 2명부터 10명까지 빠짐없이 + 무관 (총 10개)
const GROUP_SIZES = [
    { size: 2, label: '2명' },
    { size: 3, label: '3명' },
    { size: 4, label: '4명' },
    { size: 5, label: '5명' },
    { size: 6, label: '6명' },
    { size: 7, label: '7명' }, // 🔥 복구
    { size: 8, label: '8명' },
    { size: 9, label: '9명' }, // 🔥 복구
    { size: 10, label: '10명' },
    { size: 0, label: '인원무관' },
];

function MatchingSetupScreen() {
    const navigation = useNavigation<any>();
    const [selectedFood, setSelectedFood] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<number | null>(null);

    const handleNext = () => {
        if (!selectedFood) {
            Alert.alert("알림", '원하는 음식 종류를 선택해 주세요!');
            return;
        }
        if (selectedSize === null) {
            Alert.alert("알림", '인원수를 선택해 주세요!');
            return;
        }

        navigation.navigate("MatchingFindingScreen" as never, {
            food: selectedFood,
            size: selectedSize
        });
    };

    const renderFoodItem = ({ item }: { item: typeof FOOD_CATEGORIES[0] }) => {
        const isSelected = selectedFood === item.name;
        return (
            <TouchableOpacity
                style={[
                    styles.foodItemWrapper,
                    { width: ITEM_WIDTH }
                ]}
                onPress={() => setSelectedFood(item.name)}
                activeOpacity={0.7}
            >
                <View style={[styles.iconCircle, isSelected && styles.selectedIconCircle]}>
                    <Icon
                        name={item.icon}
                        size={24}
                        color={isSelected ? '#fff' : '#555'}
                    />
                </View>
                <Text style={[styles.foodText, isSelected && styles.selectedFoodText]}>
                    {item.name}
                </Text>
            </TouchableOpacity>
        );
    };

    const SizeButton = ({ sizeOption }: { sizeOption: typeof GROUP_SIZES[0] }) => {
        const isSelected = selectedSize === sizeOption.size;
        return (
            <TouchableOpacity
                style={[
                    styles.sizeButton,
                    { width: ITEM_WIDTH }, // 5열 그리드 너비 적용
                    isSelected && styles.selectedSizeButton
                ]}
                onPress={() => setSelectedSize(sizeOption.size)}
                activeOpacity={0.8}
            >
                <View style={[styles.sizeCircle, isSelected && styles.selectedSizeCircle]}>
                    <Text style={[styles.sizeButtonText, isSelected && styles.selectedSizeButtonText]}>
                        {sizeOption.size === 0 ? 'All' : sizeOption.size}
                    </Text>
                </View>
                <Text style={[styles.sizeLabel, isSelected && styles.selectedFoodText]}>
                    {sizeOption.label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>매칭 조건 설정</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. 메뉴 선택</Text>
                    <Text style={styles.sectionSubtitle}>오늘 땡기는 메뉴를 골라보세요.</Text>

                    <View style={styles.gridContainer}>
                        <FlatList
                            data={FOOD_CATEGORIES}
                            renderItem={renderFoodItem}
                            keyExtractor={item => item.name}
                            numColumns={5}
                            scrollEnabled={false}
                            columnWrapperStyle={{ justifyContent: 'flex-start' }}
                        />
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. 인원 선택</Text>
                    <Text style={styles.sectionSubtitle}>몇 명이서 드실 건가요?</Text>

                    <View style={styles.sizeGridWrapper}>
                        {GROUP_SIZES.map((option) => (
                            <SizeButton key={option.label} sizeOption={option} />
                        ))}
                    </View>
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.nextButton, (!selectedFood || selectedSize === null) && styles.disabledButton]}
                    onPress={handleNext}
                    disabled={!selectedFood || selectedSize === null}
                    activeOpacity={0.9}
                >
                    <Text style={styles.nextButtonText}>
                        다음 ({selectedFood || '메뉴'} · {selectedSize !== null ? (selectedSize === 0 ? '인원무관' : selectedSize + '명') : '인원'})
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

export default MatchingSetupScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: { width: 44, justifyContent: 'center', alignItems: 'center', marginLeft: -10 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#000', flex: 1, textAlign: 'center' },

    scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },

    section: { marginTop: 25, marginBottom: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    sectionSubtitle: { fontSize: 14, color: '#666', marginBottom: 15 },

    divider: { height: 8, backgroundColor: '#F9F9F9', marginHorizontal: -16, marginTop: 10 },

    gridContainer: { marginTop: 10 },
    foodItemWrapper: { alignItems: 'center', marginBottom: 20 },
    iconCircle: {
        width: 50, height: 50, borderRadius: 25, backgroundColor: '#F5F5F5',
        justifyContent: 'center', alignItems: 'center', marginBottom: 6,
    },
    selectedIconCircle: { backgroundColor: MAIN_COLOR },
    foodText: { fontSize: 12, color: '#555', fontWeight: '500', textAlign: 'center' },
    selectedFoodText: { color: MAIN_COLOR, fontWeight: '700' },

    sizeGridWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginTop: 10,
    },
    sizeButton: {
        alignItems: 'center',
        marginBottom: 20,
    },
    selectedSizeButton: {},
    sizeCircle: {
        width: 50,
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#DDD',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    selectedSizeCircle: {
        backgroundColor: MAIN_COLOR,
        borderColor: MAIN_COLOR,
    },
    sizeButtonText: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: 16,
    },
    selectedSizeButtonText: {
        color: '#fff',
    },
    sizeLabel: {
        fontSize: 12,
        color: '#555',
        fontWeight: '500',
    },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: 16, paddingTop: 10, paddingBottom: 25,
        backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0',
    },
    nextButton: { backgroundColor: MAIN_COLOR, paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
    disabledButton: { backgroundColor: '#CCC' },
    nextButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});