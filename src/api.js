const BASE_URL = import.meta.env.VITE_API_URL

if (!BASE_URL) {
  throw new Error("VITE_API_URL is not defined")
}

export const api = async (url, options = {}) => {
  const token = localStorage.getItem("token")

  const res = await fetch(`${BASE_URL}${url}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "Request failed")
  }

  return res.json()
}
