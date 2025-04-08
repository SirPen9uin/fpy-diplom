const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function getCsrfToken() {
    const response = await fetch(`${API_URL}/api/auth/csrf/`, {
        credentials: "include",
    });
    return response.json();
}

export async function register(email: string, password: string, username: string) {

    const response = await fetch(`${API_URL}/api/auth/register/`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, username }),
    });
    return response.json();
}

export async function login(email: string, password: string) {
    const response = await fetch(`${API_URL}/api/auth/login/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }) 
    });
    return response.json();
}

export async function logout() {
    await fetch(`${API_URL}/api/logout/`, {
        method: "POST",
        credentials: "include",
    });
}
