import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";

/**
 * Server-side search bar component with debounce
 * @param {string} searchTerm - Current search value from parent
 * @param {function} onSearchChange - Callback when search changes (debounced)
 * @param {string} placeholder - Placeholder text
 * @param {number} debounceMs - Debounce delay in milliseconds
 */
function ServerSearchBar({ searchTerm, onSearchChange, placeholder = "Search cases...", debounceMs = 500 }) {
  const [localValue, setLocalValue] = useState(searchTerm);
  const debounceTimer = useRef(null);

  // Sync local value when parent searchTerm changes (e.g., clear button)
  useEffect(() => {
    setLocalValue(searchTerm);
  }, [searchTerm]);

  const handleChange = (e) => {
    const value = e.target.value;
    setLocalValue(value);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new debounced callback
    debounceTimer.current = setTimeout(() => {
      onSearchChange(value);
    }, debounceMs);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div style={{ position: "relative", flex: "1", minWidth: "200px", maxWidth: "400px" }}>
      <input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        className="search-input"
        style={{
          width: "100%",
          paddingRight: "35px",
          boxSizing: "border-box"
        }}
      />
      <FaSearch style={{
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#888",
        pointerEvents: "none"
      }} />
    </div>
  );
}

export default ServerSearchBar;
