import axiosInstance from './axiosInstance';

const bookingApi = {
    createBooking: (data) => {
        return axiosInstance.post('/bookings', data);
    },
    getBookingById: (id) => {
        return axiosInstance.get(`/bookings/${id}`);
    },
    cancelBooking: (id) => {
        return axiosInstance.patch(`/bookings/${id}/cancel`);
    },
};

export default bookingApi;
