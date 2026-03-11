import axiosInstance from "./axiosInstance";

const authApi = {
    /**
     * Register a new user
     * @param {{ firstName, lastName, email, password }} data
     */
    register: (data) => {
        return axiosInstance.post("/auth/register", data);
    },

    /**
     * Login user
     * @param {{ email, password }} data
     */
    login: (data) => {
        return axiosInstance.post("/auth/login", data);
    },

    /**
     * Logout user
     * @param {{ refreshToken }} data
     */
    logout: (data) => {
        return axiosInstance.post("/auth/logout", data);
    },

    /**
     * Refresh access token
     * @param {{ refreshToken }} data
     */
    refreshToken: (data) => {
        return axiosInstance.post("/auth/refresh-token", data);
    },

    /**
     * Request forgot password email
     * @param {{ email }} data
     */
    forgotPassword: (data) => {
        return axiosInstance.post("/auth/forgot-password", data);
    },

    /**
     * Reset password with token
     * @param {{ token, password }} data
     */
    resetPassword: (data) => {
        return axiosInstance.post("/auth/reset-password", data);
    },

    /**
     * Verify email with token
     * @param {{ token }} data
     */
    verifyEmail: (data) => {
        return axiosInstance.post("/auth/verify-email", data);
    },

    /**
     * Resend email verification link
     * @param {{ email }} data
     */
    resendVerification: (data) => {
        return axiosInstance.post("/auth/resend-verification", data);
    },

    /**
     * Get current user profile
     */
    getProfile: () => {
        return axiosInstance.get("/auth/profile");
    },
};

export default authApi;
