import React, { useState, useEffect } from "react";
import { Routes, Route ,Navigate, Outlet } from "react-router-dom";
import Home from './components/Home.jsx';
import Login from './components/Login.jsx'; 
import Register from './components/Register.jsx';
import Logout from './components/Logout.jsx';

const PreventLoggedInAccess = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:5000/auth", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/" replace state={{ alreadyLoggedIn: true }}  />;
  }

  return <Outlet />;
};

export default function App() {
  return (
    <Routes>
      {/* Protected Login/Register Routes */}
      <Route element={<PreventLoggedInAccess />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/logout" element={<Logout />} />
    </Routes>
  );
}