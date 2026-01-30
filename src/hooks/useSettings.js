import { useState, useEffect } from "react";
import apiFetch from "../utils/api";

/**
 * Custom hook to fetch and provide application settings
 * Fetches settings from the API and provides them with fallback defaults
 */
export function useSettings() {
    const [settings, setSettings] = useState({
        coldCaseThresholdHours: 48 // Default value
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if token exists in localStorage
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        apiFetch("/settings", {
            method: "GET"
        })
            .then((res) => {
                console.log("Settings API response:", res);
                if (res?.settings) {
                    setSettings({
                        coldCaseThresholdHours: parseInt(res.settings.cold_case_threshold_hours, 10) || 48
                    });
                }
            })
            .catch((err) => {
                console.error("Failed to fetch settings:", err);
                // Keep default values if fetching fails
            })
            .finally(() => setLoading(false));
    }, []);

    return { settings, loading };
}

/**
 * Hook specifically for cold case threshold
 * Returns the threshold hours value directly
 */
export function useColdCaseThreshold() {
    const { settings, loading } = useSettings();
    return { 
        coldCaseThresholdHours: settings.coldCaseThresholdHours, 
        loading 
    };
}

export default useSettings;
