const API_URL = "http://127.0.0.1:8000/auth/";

export async function getCsrfToken() {
    const response = await fetch("http://127.0.0.1:8000/auth/csrf/", {
        credentials: "include",
    });
    return response.json();
}

export async function register(email: string, password: string, username: string) {
    const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))?.split('=')[1];

    const response = await fetch("http://127.0.0.1:8000/auth/register/", {
        method: "POST",
        credentials: "include",  // Чтобы куки отправлялись
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken || "",  // Передача CSRF токена в заголовке
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
    const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];

    const response = await fetch("http://127.0.0.1:8000/auth/logout/", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken || "",
        },
    });
    return response.json();
}
