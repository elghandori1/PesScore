import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import footballBg from "../assets/images/efootbalBG3.png";
import axios from "axios";

function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [pendingCount, setPendingCount] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Show alert for 4 seconds
  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert({ message: "", type: "" });
    }, 4000);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:5000/auth", {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status == 401) {
          return navigate("/login");
        }

        const currentUser = response.data.user;
        setUser(currentUser);
      } catch (err) {
        console.error("Error fetching user:", err.message);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const res = await axios.get("http://localhost:5000/friend-requests", {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });

        const pending = res.data.pendingRequests || [];
        setPendingCount(pending.length);
      } catch (err) {
        console.error("Failed to fetch pending requests:", err);
      }
    };
    const fetchPendingMatch = async () => {
      try {
        const res = await axios.get("http://localhost:5000/match-requests", {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });

        const pending = res.data.pendingMatch || [];
        setMatchCount(pending.length);
      } catch (err) {
        console.error("Failed to fetch pending requests:", err);
      }
    };
    if (user) {
      fetchPendingRequests();
      fetchPendingMatch();
    }
  }, [user]);
  
  // Show alert from redirected navigation
  useEffect(() => {
    const { state } = location;

    if (!user) return;
    if (state?.fromLogin) {
      showAlert(`Hello, ${user.name}!`, "success");

      setTimeout(() => {
        navigate(location.pathname, { replace: true });
      }, 0);
    }

    if (state?.alreadyLoggedIn) {
      showAlert("You're already logged in!", "error");
      setTimeout(() => {
        navigate(location.pathname, { replace: true });
      }, 0);
    }
  }, [location, navigate, user]);

  if (loading) return <div>Loading...</div>;
  return (
    <div
      className="min-h-screen flex flex-col items-center overflow-x-hidden relative"
    >
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${footballBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed"
        }}
      />

      {/* Alert Notification */}
      {alert.message && (
        <div
          className={`fixed top-4 sm:top-5 left-1/2 transform -translate-x-1/2 w-[90vw] max-w-[400px] min-w-[250px] px-4 py-3 sm:px-6 sm:py-4 rounded
    font-bold text-center z-[1000] transition-opacity duration-300 border-l-4 shadow-lg flex items-center justify-between space-x-2 sm:space-x-4
    ${alert.type === "success"
              ? "bg-green-100 text-green-800 border-green-600"
              : "bg-red-100 text-red-800 border-red-600"}`}
        >
          <span className="text-sm sm:text-base">{alert.message}</span>
          <button
            className="text-lg sm:text-xl font-bold hover:opacity-80"
            onClick={() => setAlert({ message: "", type: "" })}
            aria-label="Close alert"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <header className="w-full flex justify-between items-center px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-white fixed top-0 left-0 z-10 bg-black/60">
        <h2 className="text-xl sm:text-2xl font-bold">PesScore</h2>
        {user ? (
          <div className="flex gap-1 sm:gap-2 justify-between items-center">
            {/* Profile link - icon only on mobile */}
            <Link
              to="/profil"
              className="flex items-center gap-1 sm:gap-2 bg-white/20 hover:bg-white/40 text-white font-semibold p-2 sm:px-3 sm:py-2 rounded-full transition"
              aria-label="Profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <span className="hidden sm:inline">Profile</span>
            </Link>

            {/* Logout button - icon only on mobile */}
            <Link
              to="/logout"
              className="flex items-center gap-1 sm:gap-2 bg-red-500 hover:bg-red-700 text-white font-semibold p-2 sm:px-3 sm:py-2 rounded-full transition"
              aria-label="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </Link>
          </div>
        ) : (
          <Link
            to="/login"
            className="bg-white/20 hover:bg-white/40 text-white font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition text-sm sm:text-base"
          >
            Sign In
          </Link>
        )}
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center w-full px-3 sm:px-4 md:px-5 pt-16 sm:pt-20 pb-8 sm:pb-10">
        {/* Description Section */}
        <section className="bg-white  p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg text-center max-w-xl w-full backdrop-blur-sm">
          <h2 className="text-xl sm:text-2xl mb-3 sm:mb-4 text-blue-700 font-semibold">Description</h2>
          <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
            PesScore is a mobile-friendly web app designed to track and display
            the results and history of football matches between friends.
          </p>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center flex-wrap max-w-xl w-full mt-6 sm:mt-8 gap-3 sm:gap-4 md:gap-5">
          <Link
            to="/newfreind"
            className="bg-gradient-to-r from-blue-700 to-blue-500 hover:bg-blue-900/90 transform hover:scale-105 transition text-white p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl w-full sm:w-[45%] text-center flex flex-col items-center no-underline shadow-md hover:shadow-lg backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 mb-1 sm:mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-sm sm:text-base md:text-lg">Add Friend</span>
          </Link>

          <Link
            to="/listfreind"
            className="bg-gradient-to-r from-blue-700 to-blue-500 hover:bg-blue-900/90 transform hover:scale-105 transition text-white p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl w-full sm:w-[45%] text-center flex flex-col items-center no-underline shadow-md hover:shadow-lg relative backdrop-blur-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 mb-1 sm:mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span className="text-sm sm:text-base md:text-lg">List Friends</span>

            {/* Notification Dot */}
            {(pendingCount > 0 || matchCount > 0) && (
  <span className="absolute top-1 right-1 sm:top-2 sm:right-2 inline-block w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></span>
)}
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-800 to-blue-700 text-white w-full text-center py-4 mt-auto text-sm backdrop-blur-sm">
        PesScore © 2025 - Football Match Tracker
      </footer>
    </div>
  );
}

export default Home;