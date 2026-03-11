import axiosInstance from "./axiosInstance";

const movieApi = {
    /**
     * Get movies list with pagination
     * @param {{ page, limit, type, sortBy }} params
     */
    getMovies: (params = {}) => {
        return axiosInstance.get("/movies", { params });
    },

    /**
     * Get now showing movies
     * @param {{ page, limit }} params
     */
    getNowShowing: (params = {}) => {
        return axiosInstance.get("/movies/now-showing", { params });
    },

    /**
     * Get coming soon movies
     * @param {{ page, limit }} params
     */
    getComingSoon: (params = {}) => {
        return axiosInstance.get("/movies/coming-soon", { params });
    },

    /**
     * Get movie detail by ID
     * @param {string} id
     */
    getMovieById: (id) => {
        return axiosInstance.get(`/movies/${id}`);
    },
};

export default movieApi;
