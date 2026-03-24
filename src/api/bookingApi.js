import axiosInstance from './axiosInstance';

const bookingApi = {
    createBooking: (data) => {
        return axiosInstance.post('/bookings', data);
    },
    getMyBookings: (params = {}) => {
        return axiosInstance.get('/bookings/me', { params });
    },
    getBookingById: (id) => {
        return axiosInstance.get(`/bookings/${id}`);
    },
    cancelBooking: (id) => {
        return axiosInstance.patch(`/bookings/${id}/cancel`);
    },
};

export default bookingApi;
