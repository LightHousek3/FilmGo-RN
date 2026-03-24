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

    /**
     * Get seating for a showtime
     * @param {string} id
     */
    getShowtimeSeating: (id) => {
        return axiosInstance.get(`/showtimes/${id}/seating`);
    },
};

export default showtimeApi;
