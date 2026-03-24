import { useCallback, useEffect, useState } from "react";
import promotionApi from "../api/promotionApi";
import Config from "../config";

const extractPromotionList = (response) => {
  const payload = response?.data;

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
};

const usePromotions = (initialParams = { status: "ACTIVE", limit: 20 }) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const paramsKey = JSON.stringify(initialParams || {});

  const fetchPromotions = useCallback(
    async (params) => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = params || initialParams;
        const response = await promotionApi.getPromotions(queryParams);
        const data = extractPromotionList(response);
        const normalized = Array.isArray(data) ? data : [];

        setPromotions(normalized);
        return { success: true, data: normalized };
      } catch (err) {
        const isNetworkError =
          !err?.response ||
          err?.code === "ECONNABORTED" ||
          err?.message === "Network Error";

        if (isNetworkError) {
          console.warn("[usePromotions] API network error", {
            baseUrl: Config.api.baseUrl,
            message: err?.message,
            code: err?.code,
          });
        }

        const message = isNetworkError
          ? "Không kết nối được máy chủ. Kiểm tra API URL và mạng thiết bị."
          : err?.response?.data?.message || "Không tải được danh sách khuyến mãi.";

        setError(message);
        setPromotions([]);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [paramsKey],
  );

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  return {
    promotions,
    loading,
    error,
    refetch: fetchPromotions,
  };
};

export default usePromotions;
