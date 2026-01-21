import { incrementRequests, decrementRequests } from './spinner';

const baseUrl = process.env.REACT_APP_API_BASE_URL;

export default async function apiFetch(path, options = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
  };
  
  const finalOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    credentials: "include"
  };
  
  // ✅ Convert body to JSON string if it's a JS object
  if (finalOptions.body && typeof finalOptions.body === "object") {
    finalOptions.body = JSON.stringify(finalOptions.body);
  }
  
  // ✅ Show spinner when first request starts
  incrementRequests();

  try {
    const response = await fetch(url, finalOptions);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.log("API Error Response:", error);
      
      // ✅ Throw with proper error message hierarchy
      const errorMessage = error.message || error.error || error.msg || `API Error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    // ✅ If it's already an Error object, re-throw it
    if (error instanceof Error) {
      throw error;
    }
    // ✅ If it's a network error or other issue
    throw new Error(error?.message || "Network error occurred");
  } finally {
    // ✅ Hide spinner when all requests complete
    decrementRequests();
  }
}