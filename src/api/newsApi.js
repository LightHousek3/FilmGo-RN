import axiosInstance from "./axiosInstance";

const newsApi = {
    /**
     * Get news list
     * @param {{ page, limit, type }} params
     */
    getNews: (params = {}) => {
        return axiosInstance.get("/news", { params });
    },
    
    /**
     * Get news detail by ID
     * @param {string} id 
     */
    getNewsById: (id) => {
        return axiosInstance.get(`/news/${id}`);
    }
};

export default newsApi;
