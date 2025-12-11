// utils/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export const storage = {
    async set(key: string, value: string) {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (e) {
            console.log("[storage set error]", e);
        }
    },

    async get(key: string) {
        try {
            return await AsyncStorage.getItem(key);
        } catch (e) {
            console.log("[storage get error]", e);
            return null;
        }
    },

    async remove(key: string) {
        try {
            await AsyncStorage.removeItem(key);
        } catch (e) {
            console.log("[storage remove error]", e);
        }
    }
};
