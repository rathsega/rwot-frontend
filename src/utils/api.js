// const baseUrl = "http://51.21.130.83:5001/api"

const baseUrl = "http://localhost:5001/api"

export default async function apiFetch(path, options = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
  };
  console.log("API:", process.env.REACT_APP_API_BASE_URL);
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
  
  const response = await fetch(url, finalOptions);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "API Error");
  }
  return response.json();
}