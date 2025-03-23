import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "../store/authSlice";
import { useNavigate } from "react-router-dom";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: login, password }),
    });
  
    const responseData = await response.json();
    console.log("Ответ сервера:", responseData);
  
    if (response.ok) {
      dispatch(loginUser(responseData));
      navigate("/dashboard");
    } else {
      setError(responseData.error || "Ошибка входа");
    }
  };

  return (
    <div>
      <h2>Вход</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="E-mail"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Войти</button>
      </form>
    </div>
  );
};

export default Login;
