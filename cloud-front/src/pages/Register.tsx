import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Register = () => {
  const [login, setLogin] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateInputs = () => {
    const loginRegex = /^[a-zA-Z][a-zA-Z0-9]{3,19}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!loginRegex.test(login)) {
      return "Логин должен содержать только латинские буквы и цифры, начинаться с буквы и быть длиной 4-20 символов.";
    }
    if (!emailRegex.test(email)) {
      return "Некорректный email.";
    }
    if (!passwordRegex.test(password)) {
      return "Пароль должен быть не менее 6 символов, содержать заглавную букву, цифру и спецсимвол.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: login, first_name: firstName,last_name: lastName, email, password }),
    });

    if (response.ok) {
      navigate("/login"); // Перенаправление после успешной регистрации
    } else {
      const errorData = await response.json();
      setError(errorData.message || "Ошибка регистрации");
    }
  };

  return (
    <div className="container">
      <h2>Регистрация</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="register-container">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Логин"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Имя"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Фамилия"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Зарегистрироваться</button>
        </form>
      </div>
    </div>
  );
};

export default Register;