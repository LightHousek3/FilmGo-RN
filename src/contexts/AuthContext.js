import { createContext, useReducer, useEffect, useCallback } from 'react';
import authApi from '../api/authApi';
import storageService from '../services/storageService';

const initialState = {
    user: null,
    isAuthenticated: false,
    isInitialized: false,
};

const AUTH_ACTIONS = {
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGOUT: 'LOGOUT',
    RESTORE_SESSION: 'RESTORE_SESSION',
    UPDATE_USER: 'UPDATE_USER',
    SET_INITIALIZED: 'SET_INITIALIZED',
};

const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.LOGIN_SUCCESS:
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                isInitialized: true,
            };

        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isInitialized: true,
            };

        case AUTH_ACTIONS.RESTORE_SESSION:
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                isInitialized: true,
            };

        case AUTH_ACTIONS.UPDATE_USER:
            return {
                ...state,
                user: action.payload,
            };

        case AUTH_ACTIONS.SET_INITIALIZED:
            return {
                ...state,
                isInitialized: action.payload,
            };

        default:
            return state;
    }
};

export const AuthContext = createContext({
    ...initialState,
    login: async () => {},
    register: async () => {},
    logout: async () => {},
    forgotPassword: async () => {},
    resetPassword: async () => {},
    verifyEmail: async () => {},
    resendVerification: async () => {},
});

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    const getErrorMessage = useCallback((error, fallback) => {
        const responseData = error?.response?.data;

        if (typeof responseData?.message === 'string') {
            return responseData.message;
        }

        return fallback;
    }, []);

    const restoreSession = useCallback(async () => {
        try {
            const token = await storageService.getAccessToken();
            const user = await storageService.getUser();

            if (token && user) {
                dispatch({ type: AUTH_ACTIONS.RESTORE_SESSION, payload: user });
            }
        } finally {
            dispatch({ type: AUTH_ACTIONS.SET_INITIALIZED, payload: true });
        }
    }, []);

    useEffect(() => {
        restoreSession();
    }, [restoreSession]);

    const login = useCallback(
        async (email, password) => {
            try {
                const response = await authApi.login({ email, password });
                const {
                    user,
                    tokens: { accessToken, refreshToken },
                } = response.data.data;

                await storageService.setAccessToken(accessToken);
                await storageService.setRefreshToken(refreshToken);
                await storageService.setUser(user);

                dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
                return { success: true };
            } catch (error) {
                return {
                    success: false,
                    message: getErrorMessage(error, 'Đăng nhập thất bại. Vui lòng thử lại.'),
                };
            }
        },
        [getErrorMessage],
    );

    const register = useCallback(
        async ({ firstName, lastName, email, password }) => {
            try {
                await authApi.register({ firstName, lastName, email, password });
                return { success: true };
            } catch (error) {
                return {
                    success: false,
                    message: getErrorMessage(error, 'Đăng ký thất bại. Vui lòng thử lại.'),
                };
            }
        },
        [getErrorMessage],
    );

    const logout = useCallback(async () => {
        try {
            const refreshToken = await storageService.getRefreshToken();
            if (refreshToken) {
                await authApi.logout({ refreshToken });
            }
        } catch {
            // Force local sign-out even if logout request fails.
        } finally {
            await storageService.clearAll();
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
    }, []);

    const forgotPassword = useCallback(
        async (email) => {
            try {
                await authApi.forgotPassword({ email });
                return { success: true };
            } catch (error) {
                return {
                    success: false,
                    message: getErrorMessage(error, 'Gửi email thất bại. Vui lòng thử lại.'),
                };
            }
        },
        [getErrorMessage],
    );

    const resetPassword = useCallback(
        async (token, password) => {
            try {
                await authApi.resetPassword({ token, password });
                return { success: true };
            } catch (error) {
                return {
                    success: false,
                    message: getErrorMessage(error, 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.'),
                };
            }
        },
        [getErrorMessage],
    );

    const verifyEmail = useCallback(
        async ({ email, code, password }) => {
            try {
                const verifyResponse = await authApi.verifyEmail({ email, code });

                if (email && password) {
                    const loginResponse = await login(email, password);
                    if (!loginResponse.success) {
                        return loginResponse;
                    }
                }

                return { success: true, authenticated: false };
            } catch (error) {
                return {
                    success: false,
                    message: getErrorMessage(error, 'Xác minh email thất bại. Vui lòng thử lại.'),
                };
            }
        },
        [getErrorMessage],
    );

    const resendVerification = useCallback(
        async (email) => {
            try {
                await authApi.resendVerification({ email });
                return { success: true };
            } catch (error) {
                return {
                    success: false,
                    message: getErrorMessage(error, 'Gửi lại email thất bại. Vui lòng thử lại.'),
                };
            }
        },
        [getErrorMessage],
    );

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
                updateUser: (user) => dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: user }),
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
