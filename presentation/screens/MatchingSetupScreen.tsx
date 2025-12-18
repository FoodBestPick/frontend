import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions, FlatList, Image
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';
import { useAlert } from '../../context/AlertContext';

const { width } = Dimensions.get('window');
const MAIN_COLOR = '#FFA847';

// 📐 아이콘 크기를 더 슬림하게 조정 (14%)
const ITEM_WIDTH = width * 0.14; 
const GRID_PADDING = 36; // 좌우 여백을 넓혀서 답답함 해소

const FOOD_CATEGORIES = [
    { name: '랜덤', image: require('../../assets/icons/all.png') },
    { name: '한식', image: require('../../assets/icons/korean.png') },
    { name: '중식', image: require('../../assets/icons/chinese.png') },
    { name: '일식', image: require('../../assets/icons/japanese.png') },
    { name: '양식', image: require('../../assets/icons/western.png') },
    { name: '분식', image: require('../../assets/icons/snack.png') },
    { name: '패스트푸드', image: require('../../assets/icons/fastfood.png') },
    { name: '족발/보쌈', image: require('../../assets/icons/pork.png') },
    { name: '카페', image: require('../../assets/icons/cafe.png') },
    { name: '야식', image: require('../../assets/icons/night.png') },
];

const GROUP_SIZES = [
    { size: 2, label: '2명' },
    { size: 3, label: '3명' },
    { size: 4, label: '4명' },
    { size: 5, label: '5명' },
    { size: 0, label: '인원무관' },
];

export default function MatchingSetupScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { showAlert } = useAlert();
    const [selectedFood, setSelectedFood] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<number | null>(null);

    const handleNext = () => {
        if (!selectedFood) {
            showAlert({ title: "알림", message: '원하는 음식 종류를 선택해 주세요!' });
            return;
        }
        if (selectedSize === null) {
            showAlert({ title: "알림", message: '인원수를 선택해 주세요!' });
            return;
        }

        navigation.navigate("MatchingFindingScreen" as never, {
            food: selectedFood,
            size: selectedSize
        });
    };

    const renderFoodItem = ({ item }: { item: any }) => {
        const isSelected = selectedFood === item.name;
        return (
            <TouchableOpacity
                style={[styles.foodItemWrapper, { width: ITEM_WIDTH }]}
                onPress={() => setSelectedFood(item.name)}
                activeOpacity={0.7}
            >
                <View style={[styles.iconCircle, isSelected && styles.selectedIconCircle]}>
                    <Image 
                        source={item.image} 
                        style={[styles.categoryIcon, isSelected && { tintColor: '#fff' }]} 
                        resizeMode="contain"
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
                style={[styles.sizeButton, { width: ITEM_WIDTH }]}
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
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <Header 
                title="매칭 조건 설정" 
                showBackButton={true} 
                onBackPress={() => navigation.goBack()} 
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                            columnWrapperStyle={styles.columnWrapper}
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

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <TouchableOpacity
                    style={[styles.nextButton, (!selectedFood || selectedSize === null) && styles.disabledButton]}
                    onPress={handleNext}
                    disabled={!selectedFood || selectedSize === null}
                    activeOpacity={0.9}
                >
                    <Text style={styles.nextButtonText}>
                        다음 단계로 이동
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { paddingHorizontal: GRID_PADDING, paddingBottom: 120 },

    section: { marginTop: 25 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    sectionSubtitle: { fontSize: 14, color: '#888', marginBottom: 20 },

    divider: { height: 8, backgroundColor: '#F8F9FA', marginHorizontal: -GRID_PADDING, marginVertical: 25 },

    gridContainer: { width: '100%' },
    columnWrapper: { justifyContent: 'space-between', marginBottom: 20 },
    
    foodItemWrapper: { alignItems: 'center' },
    iconCircle: {
        width: ITEM_WIDTH, 
        height: ITEM_WIDTH, 
        borderRadius: ITEM_WIDTH / 2, 
        backgroundColor: '#F5F5F5',
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 8,
    },
    selectedIconCircle: { backgroundColor: MAIN_COLOR },
    categoryIcon: { width: '55%', height: '55%' },
    foodText: { fontSize: 11, color: '#666', fontWeight: '500', textAlign: 'center' }, // 텍스트도 살짝 축소
    selectedFoodText: { color: MAIN_COLOR, fontWeight: 'bold' },

    sizeGridWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    sizeButton: { alignItems: 'center' },
    sizeCircle: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH,
        borderRadius: 12, 
        borderWidth: 1.5,
        borderColor: '#EEE',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    selectedSizeCircle: {
        backgroundColor: MAIN_COLOR,
        borderColor: MAIN_COLOR,
    },
    sizeButtonText: { color: '#333', fontWeight: 'bold', fontSize: 15 },
    selectedSizeButtonText: { color: '#fff' },
    sizeLabel: { fontSize: 11, color: '#666', fontWeight: '500' },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: GRID_PADDING, paddingTop: 15,
        backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0',
    },
    nextButton: { 
        backgroundColor: MAIN_COLOR, 
        height: 54, 
        borderRadius: 27, 
        justifyContent: 'center', 
        alignItems: 'center',
        shadowColor: MAIN_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    disabledButton: { backgroundColor: '#DDD', shadowOpacity: 0, elevation: 0 },
    nextButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
