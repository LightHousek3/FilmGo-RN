import { useCallback, useEffect, useRef, useState } from "react";
import { bookingApi } from "../api";
import useAuth from "./useAuth";

const STATUS_TO_API = {
  all: null,
  upcoming: "UPCOMING",
  watched: "WATCHED",
  canceled: "CANCELLED",
};

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

const normalizeStatus = (statusValue, showAt) => {
  const raw = String(statusValue || "").toLowerCase();

  if (raw.includes("cancel")) return "canceled";
  if (
    raw.includes("done") ||
    raw.includes("complete") ||
    raw.includes("watch")
  ) {
    return "watched";
  }
  if (
    raw.includes("upcoming") ||
    raw.includes("book") ||
    raw.includes("paid") ||
    raw.includes("confirm")
  ) {
    return "upcoming";
  }

  const showDate = showAt ? new Date(showAt) : null;
  if (showDate && !Number.isNaN(showDate.getTime())) {
    return showDate.getTime() > Date.now() ? "upcoming" : "watched";
  }

  return "upcoming";
};

const extractSeatLabel = (item) => {
  if (Array.isArray(item?.seats) && item.seats.length) {
    const seatLabels = item.seats
      .map((seat) => {
        const seatObj = seat?.seat;

        if (seat?.seatNumber || seat?.label || seat?.name || seat?.code) {
          return seat?.seatNumber || seat?.label || seat?.name || seat?.code;
        }

        if (seatObj && typeof seatObj === "object") {
          return (
            seatObj?.seatNumber ||
            seatObj?.label ||
            seatObj?.name ||
            seatObj?.code ||
            (seatObj?.row && seatObj?.number
              ? `${seatObj.row}${seatObj.number}`
              : null)
          );
        }

        if (typeof seatObj === "string") {
          return `#${shortId(seatObj)}`;
        }

        return null;
      })
      .filter(Boolean);

    if (seatLabels.length) return seatLabels.join(", ");
    if (item?.totalSeat) return `${item.totalSeat} ghế`;
  }

  if (Array.isArray(item?.seatNumbers) && item.seatNumbers.length) {
    return item.seatNumbers.join(", ");
  }

  return "Chưa cập nhật";
};

const extractServices = (item) => {
  if (!Array.isArray(item?.services) || item.services.length === 0) {
    return [];
  }

  return item.services.map((serviceItem) => {
    const serviceData = serviceItem?.service;
    const serviceName =
      (typeof serviceData === "object" &&
        (serviceData?.name ||
          serviceData?.title ||
          serviceData?.displayName)) ||
      (typeof serviceData === "string"
        ? `Dịch vụ #${shortId(serviceData)}`
        : "Dịch vụ kèm theo");

    return {
      name: serviceName,
      quantity: Number(serviceItem?.quantity || 1),
      total: Number(serviceItem?.total || 0),
      unitPrice: Number(serviceItem?.unitPrice || 0),
    };
  });
};

const normalizeBooking = (item) => {
  const showAt = getNested(item, [
    "showtime.startTime",
    "showtime.startAt",
    "showAt",
    "startTime",
    "bookingTime",
    "createdAt",
  ]);

  const movieRaw = getNested(item, ["showtime.movie", "movie", "movieId"]);
  const screenRaw = getNested(item, ["showtime.screen", "screen", "screenId"]);
  const screenName =
    getNested(item, ["showtime.screen.name", "screen.name", "screenName"]) ||
    (typeof screenRaw === "string" ? `#${shortId(screenRaw)}` : "");

  return {
    id: getNested(item, ["id", "_id"]) || String(Math.random()),
    code:
      getNested(item, [
        "bookingCode",
        "orderCode",
        "ticketCode",
        "code",
        "id",
        "_id",
      ]) || "#N/A",
    title:
      getNested(item, [
        "movie.title",
        "showtime.movie.title",
        "movieTitle",
        "title",
      ]) ||
      (typeof movieRaw === "string"
        ? `Phim #${shortId(movieRaw)}`
        : "Không rõ tên phim"),
    movieType:
      getNested(item, [
        "showtime.movie.format",
        "showtime.movie.type",
        "movie.format",
        "movie.type",
        "movieType",
      ]) || "2D",
    theater:
      getNested(item, [
        "showtime.screen.theater.name",
        "theater.name",
        "showtime.theater.name",
        "cinema.name",
        "theaterName",
        "screen.theater.name",
      ]) ||
      (typeof screenRaw === "string"
        ? `Phòng chiếu #${shortId(screenRaw)}`
        : "Chưa cập nhật rạp"),
    screenName,
    showAt,
    bookedAt: getNested(item, [
      "createdAt",
      "bookedAt",
      "bookingTime",
      "created_time",
    ]),
    seatLabel: extractSeatLabel(item),
    totalSeat: Number(getNested(item, ["totalSeat"]) || 0),
    totalPrice: Number(
      getNested(item, [
        "totalPrice",
        "totalAmount",
        "amount",
        "price",
        "payment.total",
      ]) || 0,
    ),
    poster:
      getNested(item, [
        "movie.posterUrl",
        "movie.poster.url",
        "movie.image.url",
        "showtime.movie.image.url",
        "poster",
        "imageUrl",
      ]) || null,
    paymentMethod:
      getNested(item, [
        "payment.method",
        "paymentMethod",
        "paymentType",
        "transaction.method",
      ]) || "Chưa cập nhật",
    services: extractServices(item),
    status: normalizeStatus(item?.status, showAt),
  };
};

const extractBookingList = (response) => {
  const payload = response?.data?.data;
  return (
    (Array.isArray(payload?.results) && payload.results) ||
    (Array.isArray(payload?.bookings) && payload.bookings) ||
    (Array.isArray(payload) && payload) ||
    []
  );
};

const useTicketHistory = (initialFilter = "all") => {
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();
  const latestRequestIdRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchBookings = useCallback(
    async (filterKey = activeFilter) => {
      const requestId = ++latestRequestIdRef.current;

      if (!isAuthenticated) {
        if (!isMountedRef.current || requestId !== latestRequestIdRef.current) {
          return;
        }
        setBookings([]);
        setError("");
        setLoading(false);
        return;
      }

      try {
        if (!isMountedRef.current || requestId !== latestRequestIdRef.current) {
          return;
        }
        setLoading(true);
        setError("");

        const statusParam = STATUS_TO_API[filterKey];

        try {
          const response = await bookingApi.getMyBookings({
            page: 1,
            limit: 20,
            ...(statusParam ? { status: statusParam } : {}),
          });
          const list = extractBookingList(response);
          if (
            !isMountedRef.current ||
            requestId !== latestRequestIdRef.current
          ) {
            return;
          }
          setBookings(list.map(normalizeBooking));
        } catch (errorWithStatus) {
          if (!statusParam) {
            throw errorWithStatus;
          }

          // Fallback if backend does not support status query yet.
          const response = await bookingApi.getMyBookings({
            page: 1,
            limit: 20,
          });
          const normalized = extractBookingList(response).map(normalizeBooking);
          if (
            !isMountedRef.current ||
            requestId !== latestRequestIdRef.current
          ) {
            return;
          }
          setBookings(normalized.filter((item) => item.status === filterKey));
        }
      } catch (err) {
        if (!isMountedRef.current || requestId !== latestRequestIdRef.current) {
          return;
        }
        const message =
          err?.response?.data?.message ||
          "Không tải được lịch sử vé. Vui lòng thử lại.";
        setError(message);
        setBookings([]);
      } finally {
        if (isMountedRef.current && requestId === latestRequestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [activeFilter, isAuthenticated],
  );

  useEffect(() => {
    fetchBookings(activeFilter);
  }, [activeFilter, fetchBookings]);

  return {
    activeFilter,
    setActiveFilter,
    bookings,
    loading,
    error,
    isAuthenticated,
    refetch: () => fetchBookings(activeFilter),
  };
};

export default useTicketHistory;
