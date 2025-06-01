import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import footballBg from "../assets/images/efootbalBG5.png";

function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasNotifications, setHasNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:5000/auth/check-auth", {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          setUser(null);
        } else {
          setUser(response.data.user);
        }
      } catch (err) {
        console.error("Error fetching user:", err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const checkNotifications = async () => {
      if (!user) return;

      try {
        const [friendRequests, pendingMatches] = await Promise.all([
          axios.get("http://localhost:5000/friends/pending-friend-requests/received", {
            withCredentials: true,
          }),
          axios.get("http://localhost:5000/matches/pending-matches/received", {
            withCredentials: true,
          }),
        ]);

        const hasFriendRequests = friendRequests.data.pendingReceivedRequests.length > 0;
        const hasPendingMatches = Object.keys(pendingMatches.data.pendingMatches).length > 0;

        setHasNotifications(hasFriendRequests || hasPendingMatches);
      } catch (err) {
        console.error("Error checking notifications:", err);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/connection/logout",
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err.message);
    }
  };

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

  return (
    <div className="min-h-screen flex flex-col items-center overflow-x-hidden">
      <div
        className="fixed inset-0 w-full h-full z-0"
        style={{
          backgroundImage: `url(${footballBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      />
      <header className="w-full flex justify-between items-center px-2 xs:px-3 sm:px-4 md:px-5 py-2 xs:py-3 sm:py-4 text-white fixed z-10 bg-black/60">
        <h1 className="text-lg xs:text-xl sm:text-2xl font-bold">PesScore</h1>

        {user ? (
          <div className="flex gap-1 xs:gap-1.5 sm:gap-2 justify-between items-center">
            <Link
              to="/profile"
              className="flex items-center gap-1 sm:gap-2 bg-white/20 hover:bg-white/40 text-white font-semibold p-1.5 xs:p-2 sm:px-3 sm:py-2 rounded-full transition"
              aria-label="Profile"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 bg-red-500 hover:bg-red-700 text-white font-semibold p-2 sm:px-3 sm:py-2 rounded-full transition"
              aria-label="Logout"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 sm:w-5 sm:h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                />
              </svg>
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="bg-white/20 hover:bg-white/40 text-white leading-relaxed font-almarai font-semibold px-2 py-1 xs:px-3 xs:py-1.5 sm:px-4 sm:py-2 rounded-full transition text-xs xs:text-sm sm:text-base"
          >
            تسجيل الدخول
          </Link>
        )}
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center w-full px-2 xs:px-3 sm:px-6 md:px-8 pt-16 xs:pt-20 sm:pt-24 pb-12 xs:pb-16">
        {user ? (
          <>
            {/* Description Section */}
            <section className="bg-white/90 mt-3 xs:mt-4 sm:mt-6 p-3 xs:p-4 sm:p-6 md:p-8 rounded-lg xs:rounded-xl shadow-lg text-center w-full max-w-xl mx-auto backdrop-blur-sm">
              <h2 className="text-lg xs:text-xl sm:text-2xl mb-2 text-blue-700 font-semibold">
                PesScore
              </h2>
              <p className="text-gray-800 text-sm xs:text-base sm:text-lg leading-relaxed font-almarai">
                هو تطبيق ويب متوافق مع الجوّال مصمم لتتبع وعرض نتائج مباريات كرة القدم بين الأصدقاء.
              </p>
            </section>
            {/* Action Buttons */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 xs:gap-3 sm:gap-4 md:gap-6 max-w-xl w-full mt-3 xs:mt-4 sm:mt-6">
              <Link
                to="/new-friend"
                className="bg-gradient-to-r from-blue-700 to-blue-500 hover:bg-blue-900/90 transform hover:scale-105 transition text-white p-3 xs:p-4 sm:p-5 rounded-lg xs:rounded-xl text-center flex flex-col items-center shadow-md hover:shadow-lg backdrop-blur-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 xs:h-8 sm:h-10 md:h-12 w-6 xs:w-8 sm:w-10 md:w-12 mb-1 xs:mb-1.5 sm:mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span className="text-xs xs:text-sm sm:text-base md:text-lg font-almarai">
                  إضافة صديق
                </span>
              </Link>
              <Link
                to="/list-friend"
                className="bg-gradient-to-r from-blue-700 to-blue-500 hover:bg-blue-900/90 transform hover:scale-105 transition text-white p-3 xs:p-4 sm:p-5 rounded-lg xs:rounded-xl text-center flex flex-col items-center shadow-md hover:shadow-lg backdrop-blur-sm relative"
              >
                {hasNotifications && (
                  <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 xs:h-8 sm:h-10 md:h-12 w-6 xs:w-8 sm:w-10 md:w-12 mb-1 xs:mb-1.5 sm:mb-2"
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
                <span className="text-xs xs:text-sm sm:text-base md:text-lg font-almarai">
                  قائمة الأصدقاء
                </span>
              </Link>
            </div>
          </>
        ) : (
          <section className="relative bg-gradient-to-br from-blue-600 to-indigo-800 p-4 xs:p-6 sm:p-8 md:p-10 mt-6 xs:mt-8 sm:mt-10 rounded-xl xs:rounded-2xl sm:rounded-3xl shadow-2xl text-center max-w-xl w-full overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-1/4 left-1/4 w-20 h-20 rounded-full bg-white"></div>
              <div className="absolute bottom-1/3 right-1/3 w-16 h-16 rounded-full bg-yellow-300"></div>
              <div className="absolute top-1/3 right-1/4 w-12 h-12 rounded-full bg-green-300"></div>
            </div>

            {/* Animated border */}
            <div
              className="absolute inset-0 rounded-xl xs:rounded-2xl sm:rounded-3xl border-2 border-transparent animate-pulse"
              style={{ animationDuration: "3s" }}
            ></div>

            {/* Content */}
            <div className="relative z-10">
              <h2 className="text-xl xs:text-2xl sm:text-3xl mb-3 xs:mb-4 sm:mb-5 text-white font-bold drop-shadow-md font-almarai" dir="rtl">
                <span className="inline-block transform transition hover:scale-105">
                  وصف
                </span>
              </h2>
              <p className="text-gray-100 text-sm xs:text-base sm:text-lg leading-relaxed font-medium font-almarai" dir="rtl">
                <span dir="ltr">PesScore</span> هو{" "}
                <span className="text-yellow-300 font-bold">تطبيق ويب</span>{" "}
                متوافق مع الجوّال مصمم لتتبع وعرض نتائج مباريات كرة القدم
                بين <span className="text-green-300 font-bold">الأصدقاء</span>.
              </p>

              {/* Football/soccer ball icon */}
              <div className="mt-4 flex justify-center">
                <svg
                  className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 text-white animate-[bounce_2s_infinite,spin_5s_linear_infinite]"
                  viewBox="0 0 512 512"
                  fill="currentColor"
                >
                  <path d="M256 32C132.3 32 32 132.3 32 256s100.3 224 224 224 224-100.3 224-224S379.7 32 256 32zm0 400c-97.2 0-176-78.8-176-176s78.8-176 176-176 176 78.8 176 176-78.8 176-176 176z" />
                </svg>
              </div>
            </div>
          </section>
        )}
      </main>
      <footer className="fixed bottom-0 w-full bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white py-2 text-xs xs:text-sm z-10 shadow-lg">
        <div className="container mx-auto px-4 text-center font-almarai">
          <p className="mb-0.5 font-medium">PesScore © {new Date().getFullYear()}</p>
          <p className="text-gray-200">
            تم التطوير بواسطة <span dir="ltr">Mohammed elghandori</span>. للاقتراحات أو المشاكل،{" "}
            <Link
              to="/Developer"
              className="text-blue-200 underline hover:text-white transition-colors duration-200 font-semibold"
            >
              تواصل معي
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;