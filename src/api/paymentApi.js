import axiosInstance from './axiosInstance';

const paymentApi = {
    initiateVnpay: (data) => axiosInstance.post('/payments/vnpay', data),
};

export default paymentApi;