import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

const Auth: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            const response = await fetch("http://127.0.0.1:8000/auth/login/", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error("Ошибка авторизации");
            }

            const data = await response.json();
            dispatch(loginUser({ user: { username: data.username, email: data.email, is_admin: data.is_admin } }));
            navigate("/dashboard");
        } catch (error) {
            console.error("Ошибка входа:", error);
        }
    };

    return (
        <div>
            <h2>Вход</h2>
            <form onSubmit={handleLogin}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">Войти</button>
            </form>
        </div>
    );
};

export default Auth;
