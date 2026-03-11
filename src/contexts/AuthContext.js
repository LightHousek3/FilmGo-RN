import { createContext, useReducer, useEffect, useCallback } from "react";
import authApi from "../api/authApi";
import storageService from "../services/storageService";

// ─── Initial State ───────────────────────────────────
const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: true, // true during initial token check
    error: null,
};

// ─── Action Types ────────────────────────────────────
const AUTH_ACTIONS = {
    SET_LOADING: "SET_LOADING",
    LOGIN_SUCCESS: "LOGIN_SUCCESS",
    LOGOUT: "LOGOUT",
    SET_ERROR: "SET_ERROR",
    CLEAR_ERROR: "CLEAR_ERROR",
    RESTORE_SESSION: "RESTORE_SESSION",
    UPDATE_USER: "UPDATE_USER",
};

// ─── Reducer ─────────────────────────────────────────
const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.SET_LOADING:
            return { ...state, isLoading: action.payload };
        case AUTH_ACTIONS.LOGIN_SUCCESS:
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };
        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            };
        case AUTH_ACTIONS.SET_ERROR:
            return { ...state, error: action.payload, isLoading: false };
        case AUTH_ACTIONS.CLEAR_ERROR:
            return { ...state, error: null };
        case AUTH_ACTIONS.RESTORE_SESSION:
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                isLoading: false,
            };
        case AUTH_ACTIONS.UPDATE_USER:
            return { ...state, user: action.payload };
        default:
            return state;
    }
};

// ─── Context ─────────────────────────────────────────
export const AuthContext = createContext({
    ...initialState,
    login: async () => { },
    register: async () => { },
    logout: async () => { },
    forgotPassword: async () => { },
    resetPassword: async () => { },
    verifyEmail: async () => { },
    resendVerification: async () => { },
    clearError: () => { },
});

// ─── Provider ────────────────────────────────────────
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Restore session on mount
    useEffect(() => {
        restoreSession();
    }, []);

    const restoreSession = async () => {
        try {
            const token = await storageService.getAccessToken();
            const user = await storageService.getUser();

            if (token && user) {
                dispatch({ type: AUTH_ACTIONS.RESTORE_SESSION, payload: user });
            } else {
                dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
            }
        } catch {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
    };

    const login = useCallback(async (email, password) => {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

        try {
            const response = await authApi.login({ email, password });
            const { user, tokens: { accessToken, refreshToken } } = response.data.data;

            await storageService.setAccessToken(accessToken);
            await storageService.setRefreshToken(refreshToken);
            await storageService.setUser(user);

            dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
            return { success: true };
        } catch (error) {
            const message =
                error.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
            dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
            return { success: false, message };
        }
    }, []);

    const register = useCallback(async ({ firstName, lastName, email, password }) => {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

        try {
            await authApi.register({ firstName, lastName, email, password });
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
            return { success: true };
        } catch (error) {
            const message =
                error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
            dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
            return { success: false, message };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            const refreshToken = await storageService.getRefreshToken();
            if (refreshToken) {
                await authApi.logout({ refreshToken });
            }
        } catch {
            // Logout even if API call fails
        } finally {
            await storageService.clearAll();
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
    }, []);

    const forgotPassword = useCallback(async (email) => {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

        try {
            await authApi.forgotPassword({ email });
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
            return { success: true };
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Gửi email thất bại. Vui lòng thử lại.";
            dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
            return { success: false, message };
        }
    }, []);

    const resetPassword = useCallback(async (token, password) => {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

        try {
            await authApi.resetPassword({ token, password });
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
            return { success: true };
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Đặt lại mật khẩu thất bại. Vui lòng thử lại.";
            dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
            return { success: false, message };
        }
    }, []);

    const verifyEmail = useCallback(async (token) => {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

        try {
            await authApi.verifyEmail({ token });
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
            return { success: true };
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Xác minh email thất bại. Vui lòng thử lại.";
            dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
            return { success: false, message };
        }
    }, []);

    const resendVerification = useCallback(async (email) => {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

        try {
            await authApi.resendVerification({ email });
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
            return { success: true };
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Gửi lại email thất bại. Vui lòng thử lại.";
            dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
            return { success: false, message };
        }
    }, []);

    const clearError = useCallback(() => {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    }, []);

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                register,
                logout,
                forgotPassword,
                resetPassword,
                verifyEmail,
                resendVerification,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
