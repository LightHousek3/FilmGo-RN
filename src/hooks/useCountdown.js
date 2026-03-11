import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Countdown hook for resend cooldown
 * @param {number} initialSeconds - countdown duration
 * @returns {{ secondsLeft, isActive, start, reset }}
 */
const useCountdown = (initialSeconds = 60) => {
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!isActive || secondsLeft <= 0) return;

        intervalRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    setIsActive(false);
                    clearInterval(intervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, [isActive]);

    const start = useCallback(() => {
        setSecondsLeft(initialSeconds);
        setIsActive(true);
    }, [initialSeconds]);

    const reset = useCallback(() => {
        setSecondsLeft(0);
        setIsActive(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }, []);

    return { secondsLeft, isActive, start, reset };
};

export default useCountdown;
