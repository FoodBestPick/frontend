import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const MyPageScreen = () => {
    const menus = [
        "본인 리뷰 작성 조회",
        "맛집 즐겨찾기",
        "메뉴",
        "메뉴",
        "메뉴",
        "메뉴",
        "메뉴",
        "메뉴",
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Title */}
            <Text style={styles.title}>마이 페이지</Text>

            {/* Profile */}
            <View style={styles.profileContainer}>
                <View style={styles.imageWrapper}>
                    <Image
                        source={require("../assets/images/snowman.png")}
                        style={styles.profileImage}
                    />
                </View>

                <View style={styles.infoWrapper}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>abcdefg</Text>
                        <TouchableOpacity>
                            <Icon name="create-outline" size={16} color="#FFA847" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.email}>abcdefg@email.com</Text>
                </View>
            </View>

            {/* Menu List */}
            <View style={styles.menuContainer}>
                {menus.map((menu, index) => (
                    <TouchableOpacity key={index} style={styles.menuItem}>
                        <Text style={styles.menuText}>{menu}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
};

export default MyPageScreen;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: "center",
        backgroundColor: "#fff",
        paddingTop: 40,
        paddingBottom: 60,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
    },
    profileContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    imageWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: "#FFA847",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    profileImage: {
        width: 80,
        height: 80,
        resizeMode: "contain",
    },
    infoWrapper: {
        marginTop: 10,
        alignItems: "center",
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    name: {
        fontSize: 16,
        fontWeight: "bold",
    },
    email: {
        fontSize: 13,
        color: "#bbb",
        borderBottomWidth: 1,
        borderColor: "#FFA847",
        paddingBottom: 4,
        width: 200,
        textAlign: "center",
    },
    menuContainer: {
        width: "85%",
    },
    menuItem: {
        borderBottomWidth: 1,
        borderColor: "#FFA847",
        paddingVertical: 12,
    },
    menuText: {
        fontSize: 15,
    },
});
