import axiosInstance from "./axiosInstance";

const ticketPriceApi = {
  getTicketPrices: (params = {}) => {
    return axiosInstance.get("/ticket-prices", { params });
  },
};

export default ticketPriceApi;
