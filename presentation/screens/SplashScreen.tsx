// frontend/presentation/screens/SplashScreen.tsx
import React from "react";
import { View, Text, Image, StyleSheet, StatusBar } from "react-native";

const SplashScreen = () => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <Image
                source={require("../../assets/logo.png")}
                style={styles.logo}
            />
            <Text style={styles.slogan}>메뉴부터 식당 추천까지</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        width: 120,
        height: 120,
        resizeMode: "contain",
        marginBottom: 16,
    },
    slogan: {
        fontSize: 16,
        color: "#222",
        fontWeight: "500",
    },
});

export default SplashScreen;
