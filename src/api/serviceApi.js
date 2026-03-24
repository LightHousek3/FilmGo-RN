import axiosInstance from './axiosInstance';

const serviceApi = {
    getServices: (params) => {
        return axiosInstance.get('/services', { params });
    },
};

export default serviceApi;
