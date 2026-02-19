
export const api = async (path: string, options: any = {}) => {
    // Ensure path starts with /
    const endpoint = path.startsWith("/") ? path : `/${path}`;

    // Ensure it hits our API routes
    const url = endpoint.startsWith("/api") ? endpoint : `/api${endpoint}`;

    // 1. Prepare Headers (Cookies are sent automatically by browser)
    const headers: any = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    // 2. Prepare Body
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData) && !(options.body instanceof URLSearchParams)) {
        options.body = JSON.stringify(options.body);
    }

    try {
        const res = await fetch(url, {
            ...options,
            headers,
            credentials: "same-origin", // Important for Cookies
        });

        // 🛡️ Handle 401 Unauthorized globally
        if (res.status === 401) {
            if (typeof window !== "undefined") {
                window.location.href = "/login";
                return null;
            }
        }

        let result;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            result = await res.json();
        } else {
            const text = await res.text();
            try {
                result = JSON.parse(text);
            } catch {
                result = { message: text || `HTTP ${res.status}` };
            }
        }

        if (!res.ok) {
            // If it's our new ApiResponse format with errors
            if (result.errors) {
                // Flatten errors or just throw first one
                const firstError = Object.values(result.errors)[0];
                throw new Error((firstError as any)?.[0] || result.message || "Validation Error");
            }
            throw new Error(result.message || `Request failed (${res.status})`);
        }

        // Return the actual data payload if using standard wrapper, otherwise result
        return result.data !== undefined ? result.data : result;

    } catch (err: any) {
        console.error("API Error:", err);
        throw err;
    }
};
