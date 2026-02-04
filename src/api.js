export const api = async (url, options = {}) => {
  const token = localStorage.getItem("token") // 🔥 JWT yahan se aayega

  const res = await fetch(`http://localhost:8000${url}`, {
    method: options.method || "GET",
    body: options.body,
    headers:
      options.body instanceof FormData
        ? {
            Authorization: token ? `Bearer ${token}` : "",
          }
        : {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
  })

  if (!res.ok) {
    let message = "Server error"

    try {
      const data = await res.json()
      message = data.message || message
    } catch {
      const text = await res.text()
      message = text || message
    }

    throw new Error(message)
  }

  if (res.status === 204) return null

  return res.json()
}
