import axiosInstance from "./axiosInstance";

const bannerApi = {
    /**
     * Get banners list
     * @param {{ page, limit, status }} params
     */
    getBanners: (params = {}) => {
        return axiosInstance.get("/banners", { params });
    },
};

export default bannerApi;
