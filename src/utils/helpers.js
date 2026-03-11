/**
 * Format duration in minutes to display string
 * @param {number} minutes
 * @returns {string} e.g. "166 phút"
 */
export const formatDuration = (minutes) => {
    return `${minutes} phút`;
};

/**
 * Format date to Vietnamese locale string
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

/**
 * Get age rating badge color
 * @param {string} ageRating
 * @returns {{ bg: string, text: string }}
 */
export const getAgeRatingStyle = (ageRating) => {
    switch (ageRating) {
        case "P":
            return { bg: "bg-green-500", text: "text-white" };
        case "T13":
            return { bg: "bg-yellow-500", text: "text-black" };
        case "T16":
            return { bg: "bg-orange-500", text: "text-white" };
        case "T18":
            return { bg: "bg-red-600", text: "text-white" };
        case "C":
            return { bg: "bg-red-900", text: "text-white" };
        default:
            return { bg: "bg-gray-500", text: "text-white" };
    }
};

/**
 * Check if a movie is currently showing
 * @param {object} movie
 * @returns {boolean}
 */
export const isNowShowing = (movie) => {
    const now = new Date();
    const release = new Date(movie.releaseDate);
    const end = movie.endDate ? new Date(movie.endDate) : null;
    return release <= now && (!end || end >= now);
};

/**
 * Check if a movie is coming soon
 * @param {object} movie
 * @returns {boolean}
 */
export const isComingSoon = (movie) => {
    const now = new Date();
    const release = new Date(movie.releaseDate);
    return release > now;
};

/**
 * Truncate text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};
