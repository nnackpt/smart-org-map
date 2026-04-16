import { auth } from "./auth";
import { getConfig } from "./config";

export async function apiFetch(path: string, options?: RequestInit) {
    const { API_BASE_URL } = await getConfig()
    const token = auth.getToken()
    return fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options?.headers,
        }
    })
}