import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Auth: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        console.log(API_BASE_URL);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error("Ошибка авторизации");
            }

            const data = await response.json();
            dispatch(loginUser({
                user: {
                  id: data.id,
                  username: data.username,
                  email: data.email,
                  is_admin: data.is_admin,
                  first_name: data.first_name as string,
                  last_name: data.last_name as string,
                  file_count: data.file_count as number,
                  total_size: data.total_size as number,
                }
              }));
            navigate("/dashboard");
        } catch (error) {
            console.error("Ошибка входа:", error);
        }
    };

    return (
        <div className="container">
            <div className="auth-container">
                <h2>Вход</h2>
                <form onSubmit={handleLogin}>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit">Войти</button>
                </form>
            </div>
        </div>
    );
};

export default Auth;
