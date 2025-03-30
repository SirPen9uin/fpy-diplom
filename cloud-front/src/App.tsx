// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Auth from './components/Auth';  // Компонент для авторизации

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    const handleLogin = () => {
        console.log("handleLogin called");
        setIsAuthenticated(true);
    };

    useEffect(() => {
        if (isAuthenticated) {
            console.log("Redirecting to dashboard...");
        }
    }, [isAuthenticated]);

    return (
        <Router>
            <nav>
                <Link to="/">Главная</Link>
                <Link to="/login">Войти</Link>
                {isAuthenticated && <Link to="/dashboard">Личный кабинет</Link>}
            </nav>

            <Routes>
                <Route path="/" element={<h1>Главная страница</h1>} />
                <Route path="/login" element={<Auth onLogin={handleLogin} />} />
                <Route
                    path="/dashboard"
                    element={isAuthenticated ? <Dashboard /> : <Navigate to="/dashboard" />}
                />
            </Routes>
        </Router>
    );
};

export default App;
