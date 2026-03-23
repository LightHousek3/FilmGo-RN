import { useCallback, useEffect, useState } from "react";
import { ticketPriceApi } from "../api";

const useTicketPrices = (initialParams = { page: 1, limit: 10 }) => {
  const [ticketPrices, setTicketPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const paramsKey = JSON.stringify(initialParams || {});

  const fetchTicketPrices = useCallback(
    async (params) => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = params || initialParams;
        const response = await ticketPriceApi.getTicketPrices(queryParams);
        const prices = response?.data?.data;
        setTicketPrices(Array.isArray(prices) ? prices : []);

        return { success: true, data: Array.isArray(prices) ? prices : [] };
      } catch (err) {
        const message =
          err?.response?.data?.message || "Không tải được dữ liệu giá vé.";
        setError(message);
        setTicketPrices([]);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [paramsKey],
  );

  useEffect(() => {
    fetchTicketPrices();
  }, [fetchTicketPrices]);

  return {
    ticketPrices,
    loading,
    error,
    refetch: fetchTicketPrices,
  };
};

export default useTicketPrices;
