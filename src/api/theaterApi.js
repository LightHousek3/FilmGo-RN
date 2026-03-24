import axiosInstance from "./axiosInstance";

const theaterApi = {
    /**
     * Get theaters list
     * @param {{ page, limit, lat, lng }} params
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
     * Get list of unique locations (provinces/cities)
     */
    getLocations: () => {
        return axiosInstance.get("/theaters/locations");
    },

    /**
     * Get nearby theaters
     * @param {{ lat: number, lng: number, page?: number, limit?: number }} params
     */
    getNearby: (params = {}) => {
        return axiosInstance.get("/theaters", { params });
    },
};

export default theaterApi;
