
export const api = async (url: string, options: any = {}) => {
    let endpoint = url.startsWith('/') ? url : `/${url}`;

    // In Next.js, if we are calling our own API routes, we can just use relative paths
    const fullUrl = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;

    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

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
            throw new Error(errorData.message || `Request failed (${res.status})`);
        }

        return await res.json();
    } catch (err: any) {
        throw err;
    }
};
