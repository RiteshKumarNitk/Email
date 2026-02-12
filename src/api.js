// src/api.js  (ya jahaan bhi rakha hai)
const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

if (!BASE_URL) {
  console.error('❌ VITE_API_URL environment variable is missing! Check Vercel settings.');
}

export const api = async (url, options = {}) => {
  // Normalize URL: always start with /
  let endpoint = url.startsWith('/') ? url : `/${url}`;

  const token = localStorage.getItem("token");

  const fullUrl = `${BASE_URL}${endpoint}`;

  // Debug log – bahut helpful rahega
  console.log(`API → ${options.method || 'GET'} ${fullUrl}`);

  try {
    const res = await fetch(fullUrl, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = { message: await res.text() || `HTTP ${res.status}` };
      }
      console.error(`API Error ${res.status}:`, errorData);
      throw new Error(errorData.message || `Request failed (${res.status})`);
    }

    return await res.json();
  } catch (err) {
    console.error('Fetch failed:', err);
    throw err; // caller ko error throw karo
  }
};