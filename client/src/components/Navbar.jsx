import { Link, useLocation } from "react-router-dom";
import useAuth from "../auth/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="w-full flex justify-between items-center px-3 sm:px-4 py-2 sm:py-3 text-white fixed z-10 bg-black/60 backdrop-blur-md">
      <Link to="/">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold">PesScore</h1>
      </Link>

      {user && (
        <div className="flex gap-2 sm:gap-3 items-center">
          {location.pathname !== "/" ? (
            <Link
              to="/"
              className="font-almarai bg-white/20 hover:bg-white/40 text-white font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition text-xs sm:text-sm md:text-base flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              العودة إلى الرئيسية
            </Link>
          ) : (
            <Link
              to="/profile"
              className="flex items-center bg-white/20 hover:bg-white/40 p-1.5 sm:p-2 rounded-full transition"
              aria-label="Profile"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 sm:w-5 sm:h-5"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                fill="none"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </Link>
          )}

          <button
            onClick={logout}
            className="flex items-center bg-red-500 hover:bg-red-700 p-1.5 sm:p-2 rounded-full transition"
            aria-label="Logout"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 sm:w-5 sm:h-5"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              fill="none"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
