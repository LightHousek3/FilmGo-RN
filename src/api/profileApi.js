import axiosInstance from './axiosInstance';

const profileApi = {
    getProfile: () => {
        return axiosInstance.get('/profiles');
    },

    updateProfile: (data) => {
        return axiosInstance.put('/profiles/edit', data);
    },

    changePassword: (data) => {
        return axiosInstance.put('/profiles/change-password', data);
    },
};

export default profileApi;
