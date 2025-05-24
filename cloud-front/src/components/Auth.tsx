import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

import type { User } from "../types/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setFieldErrors({});

        const errors: typeof fieldErrors = {};

        if (!validateEmail(email)) {
            errors.email = "Введите корректный email";
        }

        if (!password.trim()) {
            errors.password = "Пароль не может быть пустым";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Ошибка входа");
                return;
            }

            const user: User = {
                id: data.id,
                username: data.username,
                email: data.email,
                is_admin: data.is_admin,
                first_name: data.first_name,
                last_name: data.last_name,
                file_count: data.file_count,
                total_size: data.total_size,
            };
            dispatch(loginUser({ user }));
            if (user.is_admin) {
                navigate("/admin");
            }
            navigate("/dashboard");
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Неизвестная ошибка");
            }
        }
    };

    return (
        <div className="container">
            <div className="auth-container">
                <h2>Вход</h2>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <form onSubmit={handleLogin} noValidate>
                    <input
                        type="text"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {fieldErrors.email && <p style={{ color: "red" }}>{fieldErrors.email}</p>}

                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {fieldErrors.password && <p style={{ color: "red" }}>{fieldErrors.password}</p>}

                    <button type="submit">Войти</button>
                </form>
            </div>
        </div>
    );
};

export default Auth;
