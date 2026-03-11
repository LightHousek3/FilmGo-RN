import axiosInstance from "./axiosInstance";

const theaterApi = {
    /**
     * Get theaters list
     * @param {{ page, limit }} params
     */
    getTheaters: (params = {}) => {
        return axiosInstance.get("/theaters", { params });
    },

    /**
     * Get theater detail
     * @param {string} id
     */
    getTheaterById: (id) => {
        return axiosInstance.get(`/theaters/${id}`);
    },

    /**
     * Get nearby theaters
     * @param {{ longitude, latitude, maxDistance }} params
     */
    getNearby: (params) => {
        return axiosInstance.get("/theaters/nearby", { params });
    },
};

export default theaterApi;
