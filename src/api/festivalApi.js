import axiosInstance from "./axiosInstance";

const festivalApi = {
  getFestivals: (params = {}) => {
    return axiosInstance.get("/festivals", { params });
  },

  getFestivalById: (id) => {
    return axiosInstance.get(`/festivals/${id}`);
  },
};

export default festivalApi;