import React, { useState, useEffect } from "react";
import axios from "axios";
import { Routes, Route ,Navigate, Outlet } from "react-router-dom";
import Home from './components/Home.jsx';
import Login from './components/Login.jsx'; 
import Register from './components/Register.jsx';
import Logout from './components/Logout.jsx';
import Profil from "./components/Profil.jsx";
import Addfriend from "./components/Addfriend.jsx";
import Listfriend from "./components/Listfriend.jsx";
import NotFound from "./components/NotFound.jsx";
import Detailsfriend from "./components/Detailsfriend.jsx";
import NewMatch from "./components/NewMatch.jsx";

const PreventLoggedInAccess = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:5000/auth", {
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
    return  (
      <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
  );
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
      <Route path="/profil" element={<Profil/>}></Route>
      <Route path="/logout" element={<Logout />} />
      <Route path="/newfreind" element={<Addfriend/>}></Route>
      <Route path="/listfreind" element={<Listfriend/>}></Route>
      <Route path="/Details-friend/:id" element={<Detailsfriend/>}></Route>
      <Route path="/newmatch/:friendId" element={<NewMatch />} />
        {/* Catch-all 404 Not Found route*/}
        <Route path="*" element={<NotFound />} />
    </Routes>
  );
}