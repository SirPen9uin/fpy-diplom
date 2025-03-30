import { useState } from "react";
import { getCsrfToken, register, login, logout } from "../api";

interface AuthProps {
    onLogin: () => void;
}

export default function Auth({ onLogin }: AuthProps) {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    async function handleRegister() {
        await getCsrfToken();
        const res = await register(email, password, username);
        setMessage(res.detail);
    }

    async function handleLogin() {
        await getCsrfToken();
        const res = await login(email, password);
        setMessage(res.detail);

        if (res.detail === "Login successful") {
            console.log("Login successful");  // Логируем успешный вход
            onLogin();  // Вызовем родительскую функцию для обновления состояния
        }
    }

    async function handleLogout() {
        const res = await logout();
        setMessage(res.detail);
    }

    return (
        <div>
            <h2>Auth</h2>
            <input
                placeholder="email"
                onChange={(e) => setEmail(e.target.value)}
            />
            {/* <input
                placeholder="username"
                onChange={(e) => setUsername(e.target.value)}
            /> */}
            <input
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleRegister}>Register</button>
            <button onClick={handleLogin}>Login</button>
            <button onClick={handleLogout}>Logout</button>
            <p>{message}</p>
        </div>
    );
}
