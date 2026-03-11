import axiosInstance from "./axiosInstance";

const showtimeApi = {
    /**
     * Get showtimes
     * @param {{ movieId, theaterId, date, status }} params
     */
    getShowtimes: (params = {}) => {
        return axiosInstance.get("/showtimes", { params });
    },

    /**
     * Get showtime detail
     * @param {string} id
     */
    getShowtimeById: (id) => {
        return axiosInstance.get(`/showtimes/${id}`);
    },
};

export default showtimeApi;
