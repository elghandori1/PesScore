import React, { useState, useEffect } from "react";
import axios from "axios";
import { Routes, Route, Navigate, Outlet, BrowserRouter } from "react-router-dom";
import Home from "./Pages/Home.jsx";
import Login from './Pages/Login.jsx';
import Register from './Pages/Register.jsx';
import Profile from './Pages/Profile.jsx';
import NewFriend from "./Pages/NewFreind.jsx";
import Listfriend from "./Pages/Listfriend.jsx";
import Detailsfriend from "./Pages/Detailsfriend.jsx";
import NewMatch from "./Pages/NewMatch.jsx";
import Admin from "./admin/Admin.jsx";
import Adminlog from "./admin/Adminlog.jsx";
import AdminRegister from "./admin/AdminRegister.jsx";
import NotFound from "./Pages/NotFound.jsx";
import Developer from "./dev/Developer.jsx";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PreventLoggedInAccess = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/check-auth`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });
        setUser(response.data.user);
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <svg
          className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace state={{ alreadyLoggedIn: true }} />;
  }

  return <Outlet />;
};

const RequireAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/check-auth`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });
        setUser(response.data.user);
      } catch (err) {
        console.error("Auth check failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
      <svg
        className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-blue-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Protected Login/Register Routes */}
        <Route element={<PreventLoggedInAccess />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<RequireAuth />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/new-friend" element={<NewFriend />} />
          <Route path="/list-friend" element={<Listfriend/>}/>
          <Route path="/Details-friend/:id" element={<Detailsfriend/>}/>
          <Route path="/newmatch/:id" element={<NewMatch />} />
        </Route>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />

         {/* Admin Routes */}
        <Route path="/admin-pesScore/login" element={<Adminlog />} />
        <Route path="/admin-pesScore/register" element={<AdminRegister />} />
        <Route path="/admin-pesScore" element={<Admin />} />
        <Route path="/admin-pesScore/users" element={<Admin />} />
       
       <Route path="/Developer" element={<Developer />} />
      </Routes>
    </BrowserRouter>
  );
}