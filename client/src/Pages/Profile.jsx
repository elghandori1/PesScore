import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import footballBg from "../assets/images/efootbalBG5.png";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:5000/profile", {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });
        setUser(response.data.user);
      } catch (err) {
        console.error("home fetch error:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
      <svg className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-100 overflow-hidden">
  {/* Background Image */}
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
  
      {/* Header */}
      <header className="w-full flex justify-between items-center p-3 sm:px-6 sm:py-4 text-white fixed z-30 bg-black/70 backdrop-blur-sm">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">PesScore</h2>
        <Link 
          to="/"
          className="bg-white/20 hover:bg-white/40 text-white font-semibold px-2 sm:px-4 py-1.5 sm:py-2 rounded-full transition text-xs sm:text-sm md:text-base flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>
      </header>
    

  {/* Main Content */}
  <main className="flex flex-col items-center w-full px-4 sm:px-6 md:px-8 pb-16">
      <div className="pt-24 sm:pt-28 w-full max-w-md">
        <div className="bg-white/20 backdrop-blur-md text-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4">
          <div className="text-center mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">User Profile</h2>
            <p className="text-white/80 text-sm">Your account information</p>
          </div>

          {user ? (
            <>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-300">Account Name:</p>
                <p className="text-base sm:text-lg font-medium">{user.name_account}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-300">Game ID:</p>
                <p className="text-base sm:text-lg font-medium">{user.id_account}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-300">Email:</p>
                <p className="text-base sm:text-lg font-medium">{user.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-300">Date Created:</p>
                <p className="text-base sm:text-lg font-medium">{new Date(user.created_at).toLocaleString()}</p>
              </div>
              <button
                disabled
                className="mt-4 w-full bg-gray-500 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg cursor-not-allowed opacity-60 text-sm sm:text-base"
              >
                Update Info (coming soon)
              </button>
            </>
          ) : (
            <p className="text-2xl font-bold text-white">Loading profile...</p>
          )}
        </div>
      </div>
  </main>

      {/* Footer */}
     <footer className="fixed bottom-0 w-full bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white py-2 text-xs xs:text-sm z-10 shadow-lg">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-200">
            Developed by Mohammed elghandori For any issues or suggestions, please{" "}
            <Link 
              to="/Developer" 
              className="text-blue-200 underline hover:text-white transition-colors duration-200 font-semibold "
            >
              contact me
            </Link>
          </p>
        </div>
      </footer>
</div>
  );
}

export default Profile;