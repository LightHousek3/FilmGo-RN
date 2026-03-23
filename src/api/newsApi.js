import axiosInstance from './axiosInstance';

const getNewsList = (params) => {
    return axiosInstance.get('/news', { params });
};

const getNewsDetail = (id) => {
    return axiosInstance.get(`/news/${id}`);
};

export default {
    getNewsList,
    getNewsDetail,
};
