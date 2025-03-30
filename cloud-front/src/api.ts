const API_URL = "http://127.0.0.1:8000/auth/";

export async function getCsrfToken() {
    const response = await fetch(`${API_URL}auth/csrf/`, {
        credentials: "include",
    });
    return response.json();
}

export async function register(email: string, password: string, username: string) {

    const response = await fetch(`${API_URL}/register/`, {
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
    const response = await fetch(`${API_URL}login/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }) 
    });
    return response.json();
}

export async function logout() {
    await fetch(`${API_URL}logout/`, {
        method: "POST",
        credentials: "include",
    });
}
