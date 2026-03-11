import axiosInstance from "./axiosInstance";

const promotionApi = {
    /**
     * Get promotions list
     * @param {{ page, limit, status }} params
     */
    getPromotions: (params = {}) => {
        return axiosInstance.get("/promotions", { params });
    },

    /**
     * Get promotion detail
     * @param {string} id
     */
    getPromotionById: (id) => {
        return axiosInstance.get(`/promotions/${id}`);
    },
};

export default promotionApi;
