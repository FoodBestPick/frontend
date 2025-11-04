import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    StatusBar,
    Dimensions
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

    const categories: { key: CategoryKey; icon?: any }[] = [
        { key: "전체" },
        { key: "패스트푸드" },
        { key: "카페/디저트" },
        { key: "족발/보쌈" },
        { key: "야식" },
        { key: "한식" },
        { key: "양식" },
        { key: "중식" },
        { key: "분식" },
        { key: "일식" },
    ];

    const getStoresByCategory = (category: CategoryKey): Store[] =>
        category === "전체" ? [] : foodRes[category] || [];

    const renderCategorySection = (category: string, stores: Store[]) => (
        <View key={category} style={styles.categorySection}>
            <Text style={styles.subTitle}>{category}</Text>
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={stores}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        {item.image?.[0] && (
                            <Image source={{ uri: item.image[0] }} style={styles.cardImage} />
                        )}
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        <Text style={styles.cardRating}>{item.rating}</Text>
                    </View>
                )}
            />
        </View>
    );

    const renderCoupangCard = ({ item, index }: { item: Store; index: number }) => (
        <View style={styles.storeCardCoupang}>
            <Text style={styles.rankText}>{index + 1}</Text>
            <View style={styles.imageGrid}>
                {item.image?.[0] && (
                    <Image source={{ uri: item.image[0] }} style={styles.mainImage} />
                )}
                <View style={styles.subImageColumn}>
                    {item.image?.slice(1, 3)?.map(
                        (uri, idx) =>
                            uri && <Image key={idx} source={{ uri }} style={styles.subImage} />,
                    )}
                </View>
            </View>
            <View style={styles.storeInfo}>
                <Text style={styles.storeNameCoupang}>{item.name}</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.ratingText}>{item.rating}</Text>
                    <Text style={styles.distanceText}>📍 0.8km</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            {selectedCategory === "전체" ? (
                <FlatList<[string, Store[]]>
                    data={Object.entries(foodRes)}
                    keyExtractor={(item) => item[0]}
                    renderItem={({ item }) => renderCategorySection(item[0], item[1])}
                    showsVerticalScrollIndicator={false}
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
                                {categories.map((c) => (
                                    <TouchableOpacity
                                        key={c.key}
                                        style={[
                                            styles.categoryItem,
                                            selectedCategory === c.key && styles.categoryItemActive,
                                        ]}
                                        onPress={() => {
                                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                            setSelectedCategory(c.key);
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryText,
                                                selectedCategory === c.key && styles.categoryTextActive,
                                            ]}
                                        >
                                            {c.key}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.recommendHeader}>
                                <Text style={styles.recommendTitle}>맛집 추천</Text>
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
                                {categories.map((c) => (
                                    <TouchableOpacity
                                        key={c.key}
                                        style={[
                                            styles.categoryItem,
                                            selectedCategory === c.key && styles.categoryItemActive,
                                        ]}
                                        onPress={() => setSelectedCategory(c.key)}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryText,
                                                selectedCategory === c.key && styles.categoryTextActive,
                                            ]}
                                        >
                                            {c.key}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
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
    categorySection: { marginTop: 15, paddingHorizontal: 15 },
    subTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
    card: {
        backgroundColor: "#fff",
        width: 150,
        marginRight: 15,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        paddingBottom: 10,
    },
    cardImage: {
        width: "100%",
        height: 100,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
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
        width: width * 0.63,
        aspectRatio: 4 / 3.5,
        borderRadius: 10,
        resizeMode: "cover",
    },
    subImageColumn: { justifyContent: "space-between" },
    subImage: {
        width: width * 0.2,
        height: width * 0.25,
        borderRadius: 10,
        resizeMode: "cover",
    },
    storeInfo: { marginTop: 5 },
    storeNameCoupang: { fontSize: 15, fontWeight: "600", color: "#000" },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    ratingText: { fontSize: 13, color: "#555" },
    distanceText: { fontSize: 12, color: "#777" },
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
    tabItem: { alignItems: "center" },
    tabLabel: { fontSize: 11, color: "#999", marginTop: 3 },
    tabLabelActive: { color: "#FFA847", fontWeight: "600" },
});
