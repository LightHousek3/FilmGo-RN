import { useCallback, useState } from "react";
import { bookingApi } from "../api";

const getNested = (obj, paths) => {
  for (const path of paths) {
    const value = path.split(".").reduce((acc, key) => acc?.[key], obj);
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return null;
};

const shortId = (value) => {
  if (!value) return "";
  const text = String(value);
  return text.length > 6 ? text.slice(-6).toUpperCase() : text.toUpperCase();
};

const normalizeServices = (services) => {
  if (!Array.isArray(services) || services.length === 0) return [];

  return services.map((serviceItem) => {
    const serviceData =
      serviceItem?.service || serviceItem?.serviceId || serviceItem?.item;

    const name =
      serviceItem?.name ||
      serviceItem?.serviceName ||
      (typeof serviceData === "object" &&
        (serviceData?.name ||
          serviceData?.title ||
          serviceData?.displayName)) ||
      (typeof serviceData === "string"
        ? `Dịch vụ #${shortId(serviceData)}`
        : null) ||
      "Dịch vụ kèm theo";

    const quantity = Number(
      serviceItem?.quantity || serviceItem?.qty || serviceItem?.count || 1,
    );

    return { name, quantity };
  });
};

const normalizeDetailBooking = (booking, detail) => {
  const merged = { ...booking, ...(detail || {}) };

  return {
    ...merged,
    services: normalizeServices(merged?.services),
    paymentMethod:
      merged?.paymentMethod ||
      getNested(merged, [
        "payment.method",
        "paymentMethod",
        "paymentType",
        "transaction.method",
      ]) ||
      "Chưa cập nhật",
    bookedAt:
      merged?.bookedAt ||
      getNested(merged, [
        "createdAt",
        "bookedAt",
        "bookingTime",
        "created_time",
      ]),
  };
};

const useBookingDetail = () => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const openBookingDetail = useCallback(async (booking) => {
    if (!booking?.id) {
      setSelectedBooking(booking || null);
      return;
    }

    try {
      setLoadingDetail(true);
      const response = await bookingApi.getBookingById(booking.id);

      const detail = response?.data?.data || null;
      setSelectedBooking(normalizeDetailBooking(booking, detail));
    } catch (err) {
      console.log(
        "[BookingDetail API] error",
        err?.response?.data || err?.message,
      );
      setSelectedBooking(normalizeDetailBooking(booking, null));
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const closeBookingDetail = useCallback(() => {
    setSelectedBooking(null);
  }, []);

  return {
    selectedBooking,
    loadingDetail,
    openBookingDetail,
    closeBookingDetail,
  };
};

export default useBookingDetail;
