import axiosInstance from "./axiosInstance";

const bookingApi = {
  /**
   * Get current user's bookings
   * Endpoint: GET /api/v1/bookings/me
   * @param {{ page, limit, sortBy, status }} params
   */
  getMyBookings: (params = {}) => {
    return axiosInstance.get("/bookings/me", { params });
  },

  /**
   * Get booking detail by ID
   * Endpoint: GET /api/v1/bookings/:id
   * @param {string} id
   */
  getBookingById: (id) => {
    return axiosInstance.get(`/bookings/${id}`);
  },
};

export default bookingApi;
