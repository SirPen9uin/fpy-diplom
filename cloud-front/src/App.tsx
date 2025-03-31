import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import Dashboard from "./pages/Dashboard";
import Auth from "./components/Auth";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import AdminPanel from "./components/AdminPanel";

const App: React.FC = () => {
    const isAuthenticated = useSelector((state: RootState) => state.auth.user !== null);

    return (
        <Router>
            <Header />
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Auth />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
                <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/dashboard" />} />
                <Route path="/admin" element={<AdminPanel />} />
            </Routes>
        </Router>
    );
};

export default App;
