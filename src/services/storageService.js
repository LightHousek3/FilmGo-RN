import AsyncStorage from "@react-native-async-storage/async-storage";
import Config from "../config";

const { accessTokenKey: TOKEN_KEY, refreshTokenKey: REFRESH_TOKEN_KEY, userKey: USER_KEY } = Config.auth;

const storageService = {
    // ─── Access Token ─────────────────────────────────
    getAccessToken: async () => {
        return AsyncStorage.getItem(TOKEN_KEY);
    },

    setAccessToken: async (token) => {
        return AsyncStorage.setItem(TOKEN_KEY, token);
    },

    removeAccessToken: async () => {
        return AsyncStorage.removeItem(TOKEN_KEY);
    },

    // ─── Refresh Token ────────────────────────────────
    getRefreshToken: async () => {
        return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    },

    setRefreshToken: async (token) => {
        return AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
    },

    removeRefreshToken: async () => {
        return AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    },

    // ─── User ─────────────────────────────────────────
    getUser: async () => {
        const user = await AsyncStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    setUser: async (user) => {
        return AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    removeUser: async () => {
        return AsyncStorage.removeItem(USER_KEY);
    },

    // ─── Clear All ────────────────────────────────────
    clearAll: async () => {
        await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
    },
};

export default storageService;
