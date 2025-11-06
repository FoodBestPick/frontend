import React, { useState, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Animated
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { foodRes, CategoryKey, Store } from "../../data/mock/foodRes";
import { LayoutAnimation } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native"; // ✅ 추가

const { width } = Dimensions.get("window");

const UserMain = () => {
    const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("전체");
    const navigation = useNavigation(); // ✅ 추가

    const categories: { key: CategoryKey; icon: any }[] = [
        { key: "전체", icon: require("../../assets/icons/all.png") },
        { key: "패스트푸드", icon: require("../../assets/icons/fastfood.png") },
        { key: "카페/디저트", icon: require("../../assets/icons/cafe.png") },
        { key: "족발/보쌈", icon: require("../../assets/icons/pork.png") },
        { key: "야식", icon: require("../../assets/icons/night.png") },
        { key: "한식", icon: require("../../assets/icons/korean.png") },
        { key: "양식", icon: require("../../assets/icons/western.png") },
        { key: "중식", icon: require("../../assets/icons/chinese.png") },
        { key: "분식", icon: require("../../assets/icons/snack.png") },
        { key: "일식", icon: require("../../assets/icons/japanese.png") },
    ];


    const getStoresByCategory = (category: CategoryKey): Store[] => {
        if (category === "전체") return [];

        const stores = foodRes[category] || [];

        // ⭐ 평점 숫자만 추출해서 내림차순 정렬
        return [...stores].sort((a, b) => {
            const ratingA = parseFloat(String(a.rating).replace(/[^\d.]/g, ""));
            const ratingB = parseFloat(String(b.rating).replace(/[^\d.]/g, ""));
            return ratingB - ratingA;
        });
    };



    const CategorySection = ({
        category,
        stores,
    }: {
        category: string;
        stores: Store[];
    }) => {
        const scrollX = useRef(new Animated.Value(0)).current;
        const [scrollBarWidth, setScrollBarWidth] = useState(50);
        const [scrollViewWidth, setScrollViewWidth] = useState(1);
        const [contentWidth, setContentWidth] = useState(1);
        const [trackWidth, setTrackWidth] = useState(1);

        // ✅ translateX = 스크롤 시 막대의 이동 거리
        const translateX = scrollX.interpolate({
            inputRange: [0, Math.max(contentWidth - scrollViewWidth, 1)],
            outputRange: [0, Math.max(trackWidth - scrollBarWidth, 0)],
            extrapolate: "clamp",
        });

        const onScroll = Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
        );

        // ✅ 스크롤바 길이 자동 계산
        const updateScrollBarWidth = (scrollW: number, contentW: number, tWidth: number) => {
            if (tWidth <= 0 || contentW <= 0) return;

            // ✅ 스크롤 가능한 경우만 비율 계산
            if (contentW > scrollW) {
                const ratio = scrollW / contentW;
                const newWidth = Math.max(tWidth * ratio * 1.1, 40); // 약간 길게
                setScrollBarWidth(newWidth);
            } else {
                // ✅ 아직 데이터 로드 중일 때 (스크롤 불가)
                setScrollBarWidth(tWidth * 0.3); // 트랙의 30%만 기본 표시 (시각적 안정)
            }
        };

        return (
            <View key={category} style={styles.categorySection}>
                <Text style={styles.subTitle}>{category}</Text>
                <Animated.FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={stores}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item, index }) => (
                        <View style={styles.card}>
                            {index < 3 && (
                                <View
                                    style={[
                                        styles.rankBadge,
                                        index === 0
                                            ? { backgroundColor: "#FFD700" }
                                            : index === 1
                                                ? { backgroundColor: "#C0C0C0" }
                                                : { backgroundColor: "#CD7F32" },
                                    ]}
                                >
                                    <Text style={styles.rankBadgeText}>{index + 1}</Text>
                                </View>
                            )}
                            {item.image?.[0] && (
                                <Image
                                    source={{ uri: item.image[0] }}
                                    style={styles.cardImage}
                                />
                            )}
                            <Text style={styles.cardTitle}>{item.name}</Text>
                            <Text style={styles.cardRating}>⭐ {item.rating}</Text>
                        </View>
                    )}
                    onScroll={onScroll}
                    onContentSizeChange={(w) => {
                        setContentWidth(w);
                        updateScrollBarWidth(scrollViewWidth, w, trackWidth);
                    }}
                    onLayout={(e) => {
                        const w = e.nativeEvent.layout.width;
                        setScrollViewWidth(w);
                        updateScrollBarWidth(w, contentWidth, trackWidth);
                    }}

                />

                <View
                    style={styles.scrollTrack}
                    onLayout={(e) => {
                        const tw = e.nativeEvent.layout.width;
                        setTrackWidth(tw);
                        updateScrollBarWidth(scrollViewWidth, contentWidth, tw);
                    }}
                >
                    <Animated.View
                        style={[
                            styles.scrollThumb,
                            {
                                width: scrollBarWidth,
                                transform: [{ translateX }],
                            },
                        ]}
                    />
                </View>

            </View>
        );
    };





    const renderCoupangCard = ({ item, index }: { item: Store; index: number }) => (
        <View style={styles.storeRow}>
            {/* 상단: 랭킹 + 음식점 이름 */}
            <View style={styles.headerRow}>
                {index < 3 && ( // 🏅 1~3등까지만 표시
                    <View
                        style={[
                            styles.rankBadgeList,
                            index === 0
                                ? { backgroundColor: "#FFD700" } // 금
                                : index === 1
                                    ? { backgroundColor: "#C0C0C0" } // 은
                                    : { backgroundColor: "#CD7F32" }, // 동
                        ]}
                    >
                        <Text style={styles.rankBadgeListText}>{index + 1}</Text>
                    </View>
                )}

                <Text style={styles.storeName}>{item.name}</Text>
            </View>

            {/* 이미지 */}
            <View style={styles.imageGridVertical}>
                {item.image?.[0] && (
                    <Image source={{ uri: item.image[0] }} style={styles.mainImageVertical} />
                )}
                <View style={styles.subImageColumnVertical}>
                    {item.image?.slice(1, 3)?.map(
                        (uri, idx) =>
                            uri && <Image key={idx} source={{ uri }} style={styles.subImageVertical} />,
                    )}
                </View>
            </View>

            {/* 하단 정보 */}
            <View style={styles.infoRow}>
                <Text style={styles.ratingText}>
                    ⭐ {item.rating.toFixed(1)} ({item.reviews}+)
                </Text>
                <Text style={styles.distanceText}>📍 0.8km</Text>
            </View>

            {/* 음식점 구분선 */}
            <View style={styles.divider} />
        </View>
    );





    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            {selectedCategory === "전체" ? (
                <FlatList<[string, Store[]]>
                    data={Object.entries(foodRes)}
                    keyExtractor={(item) => item[0]}
                    renderItem={({ item }) => (
                        <CategorySection
                            category={item[0]}
                            stores={
                                [...item[1]]
                                    .sort((a, b) => b.rating - a.rating) // ✅ 평점 높은 순 정렬
                                    .map((store) => ({
                                        ...store,
                                        rating: Number(store.rating.toFixed(1)), // ✅ 소수점 한 자리만 유지
                                    }))
                            }
                        />
                    )} showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <>
                            <View style={[styles.header, { marginTop: 5 }]}>
                                <Text style={styles.title}>맛집 찾기</Text>
                            </View>

                            <View style={styles.searchBox}>
                                <Icon
                                    name="search-outline"
                                    size={18}
                                    color="#FFA847"
                                    style={styles.searchIcon}
                                />
                                <TouchableOpacity
                                    style={styles.searchInput}
                                    activeOpacity={0.8}
                                    onPress={() => navigation.navigate("SearchScreen" as never)}
                                >
                                    <Text style={{ color: "#bbb", fontSize: 14 }}>
                                        원하는 음식을 입력해주세요
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.categoryContainer}>
                                <FlatList
                                    data={categories}
                                    keyExtractor={(item) => item.key}
                                    numColumns={5}
                                    scrollEnabled={false}
                                    contentContainerStyle={styles.gridContainer}
                                    renderItem={({ item }) => {
                                        const isSelected = selectedCategory === item.key;
                                        return (
                                            <TouchableOpacity
                                                style={[
                                                    styles.categoryButton,
                                                    isSelected && styles.categoryButtonSelected,
                                                ]}
                                                onPress={() => {
                                                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                                    setSelectedCategory(item.key);
                                                }}
                                                activeOpacity={0.8}
                                            >
                                                <Image
                                                    source={item.icon}
                                                    style={[styles.icon, isSelected && styles.iconSelected]}
                                                />
                                                <Text
                                                    style={[styles.text, isSelected && styles.textSelected]}
                                                >
                                                    {item.key}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    }}
                                />
                            </View>

                            <View style={styles.recommendHeader}>
                                <Text style={styles.recommendTitle}>맛집 추천</Text>
                                <Text style={styles.subTitle}>{selectedCategory}</Text>
                            </View>


                        </>
                    }
                />
            ) : (
                <FlatList<Store>
                    data={getStoresByCategory(selectedCategory)}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderCoupangCard}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: 10 }} // ✅ 이 한 줄 추가 (중요)

                    ListHeaderComponent={
                        <>
                            <View style={styles.header}>
                                <Text style={styles.title}>맛집 찾기</Text>
                            </View>

                            <View style={styles.searchBox}>
                                <Icon
                                    name="search-outline"
                                    size={18}
                                    color="#FFA847"
                                    style={styles.searchIcon}
                                />
                                <TouchableOpacity
                                    style={styles.searchInput}
                                    activeOpacity={0.8}
                                    onPress={() => navigation.navigate("SearchScreen" as never)}
                                >
                                    <Text style={{ color: "#bbb", fontSize: 14 }}>
                                        원하는 음식을 입력해주세요
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.categoryContainer}>
                                <FlatList
                                    data={categories}
                                    keyExtractor={(item) => item.key}
                                    numColumns={5}
                                    scrollEnabled={false}
                                    contentContainerStyle={styles.gridContainer}
                                    renderItem={({ item }) => {
                                        const isSelected = selectedCategory === item.key;
                                        return (
                                            <TouchableOpacity
                                                style={[
                                                    styles.categoryButton,
                                                    isSelected && styles.categoryButtonSelected,
                                                ]}
                                                onPress={() => {
                                                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                                    setSelectedCategory(item.key);
                                                }}
                                                activeOpacity={0.8}
                                            >
                                                <Image
                                                    source={item.icon}
                                                    style={[styles.icon, isSelected && styles.iconSelected]}
                                                />
                                                <Text
                                                    style={[styles.text, isSelected && styles.textSelected]}
                                                >
                                                    {item.key}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    }}
                                />
                            </View>

                            <View style={styles.recommendHeader}>
                                <Text style={styles.recommendTitle}>맛집 추천</Text>
                                <Text style={styles.subTitle}>{selectedCategory}</Text>
                            </View>


                        </>
                    }
                />
            )}

            {/* ✅ 하단 네비게이션 */}
            <View style={styles.tabBar}>
                {[
                    { label: "홈", icon: "home-outline", route: "UserMain" },
                    { label: "룰렛", icon: "refresh-outline", route: "RouletteScreen" },
                    { label: "매칭", icon: "people-outline", route: "MatchScreen" },
                    { label: "마이페이지", icon: "person-outline", route: "MyPageScreen" },
                    { label: "알림", icon: "notifications-outline", route: "NotificationScreen" },
                ].map(({ label, icon, route }, idx) => (
                    <TouchableOpacity
                        key={idx}
                        style={styles.tabItem}
                        onPress={() => navigation.navigate(route as never)} // ✅ 작동 부분
                    >
                        <Icon
                            name={icon}
                            size={22}
                            color={label === "홈" ? "#FFA847" : "#999"}
                        />
                        <Text
                            style={[styles.tabLabel, label === "홈" && styles.tabLabelActive]}
                        >
                            {label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
};

export default UserMain;

// 💅 스타일 (기존과 동일)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: { alignItems: "center", marginTop: 10 },
    title: { fontSize: 20, fontWeight: "700", color: "#000" },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        borderWidth: 1,
        borderColor: "#FFA847",
        borderRadius: 10,
        width: "90%",
        height: 38,
        marginTop: 10,
        paddingHorizontal: 10,
    },
    searchIcon: { marginRight: 6 },
    searchInput: { flex: 1, fontSize: 14, color: "#333" },
    categoryContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 12,
        marginTop: 16,
    },
    categoryItem: {
        alignItems: "center",
        justifyContent: "center",
        width: 60,
        height: 60,
        margin: 6,
        borderRadius: 14
    },
    categoryItemActive: { backgroundColor: "#FFA847" },
    categoryText: { fontSize: 12, color: "#888", marginTop: 4, textAlign: "center" },
    categoryTextActive: { color: "#fff", fontWeight: "600" },
    categorySection: {
        marginTop: 15, paddingHorizontal: 15, marginBottom: 4, // ✅ 섹션 아래 살짝 여백
    },
    subTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
    card: {
        backgroundColor: "#fff",
        width: 150,
        marginRight: 15,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#eee",
        padding: 6, // ✅ 이미지와 테두리 사이 여백
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },

    cardImage: {
        width: "100%",
        height: 100,
        borderRadius: 14, // ✅ 카드보다 살짝 작은 radius로 내부 둥글기
        resizeMode: "cover",
    },

    cardTitle: { fontSize: 14, fontWeight: "600", marginTop: 8, marginLeft: 8 },
    cardRating: { fontSize: 12, color: "#777", marginLeft: 8 },
    recommendHeader: { marginTop: 20, marginLeft: 15 },
    recommendTitle: { fontSize: 17, fontWeight: "800" },
    storeCardCoupang: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 12,
        marginHorizontal: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    rankText: { color: "#FFA847", fontWeight: "700", fontSize: 16, marginBottom: 5 },
    imageGrid: { flexDirection: "row", justifyContent: "space-between" },

    mainImage: {
        flex: 2,
        height: 110,
        resizeMode: "cover",
        borderRadius: 10,
    },
    // ✅ 음식점 리스트형 카드용 스타일
    // ✅ 리스트형 평면 카드 (실선 구분)
    storeRow: {
        backgroundColor: "#fff",
        paddingVertical: 12,
        paddingHorizontal: 16,
    },

    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },

    rankBadgeList: {
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },

    rankBadgeListText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 12,
    },

    storeName: {
        fontSize: 15,
        fontWeight: "700",
        color: "#000",
    },

    imageGridVertical: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },

    mainImageVertical: {
        flex: 2.2, // ✅ 살짝 더 넓게 (왼쪽 메인 강조)
        height: 125,
        resizeMode: "cover",
        borderRadius: 10,
    },

    subImageColumnVertical: {
        flex: 1,
        justifyContent: "space-between",
        marginLeft: 10,
    },

    subImageVertical: {
        height: 58, // ✅ 두 장이 균형감 있게 배치되도록
        width: "100%",
        borderRadius: 10,
        resizeMode: "cover",
    },

    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    ratingText: {
        fontSize: 13,
        color: "#333",
    },

    distanceText: {
        fontSize: 13,
        color: "#777",
    },

    divider: {
        height: 1,
        backgroundColor: "#000000", // ✅ 회색 실선으로 구분
        marginTop: 12,
    },


    rankBadge: {
        position: "absolute",
        top: 11,        // 여백
        left: 11,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2,     // ✅ 이미지보다 위로 올리기
        elevation: 2,  // ✅ 안드로이드에서도 위로
    },

    rankBadgeText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 12,
    },
    tabBar: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        borderTopWidth: 1,
        borderColor: "#eee",
        backgroundColor: "#fff",
        height: 65,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 8,
    },
    scrollTrack: {
        width: "55%",        // ✅ 전체 길이 줄이기
        alignSelf: "center", // 가운데 정렬
        height: 5,           // ✅ 더 굵게
        backgroundColor: "#e6e6e6",
        borderRadius: 4,
        marginTop: 8,
        overflow: "hidden",
    },
    scrollThumb: {
        height: 5,           // ✅ 동일한 두께
        backgroundColor: "#FFA847",
        borderRadius: 4,
    },
    gridContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
    },
    categoryButton: {
        width: width / 5 - 10,
        margin: 5,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 6,
        borderRadius: 10,
    },
    categoryButtonSelected: {
        backgroundColor: "#FFF4E6",
    },
    icon: {
        width: 36,
        height: 36,
        resizeMode: "contain",
        marginBottom: 5,
        tintColor: "#888",
    },
    iconSelected: {
        tintColor: "#FFA847",
    },
    text: {
        fontSize: 12,
        color: "#555",
        textAlign: "center",
    },
    textSelected: {
        color: "#FFA847",
        fontWeight: "700",
    },


    tabItem: { alignItems: "center" },
    tabLabel: { fontSize: 11, color: "#999", marginTop: 3 },
    tabLabelActive: { color: "#FFA847", fontWeight: "600" },
});
