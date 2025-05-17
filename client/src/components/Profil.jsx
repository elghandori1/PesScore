import React, { useEffect, useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import axios from "axios";
import footballBg from "../assets/images/efootbalBG3.png";

function Profil() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchProfile = async () => {
        try {
          const response = await axios.get("http://localhost:5000/profile", { 
            withCredentials: true 
          });
  
          if (response.status !== 200) {
            throw new Error('Not authenticated');
          }
  
          setUser(response.data.user);
        } catch (err) {
          console.error("Error fetching profile:", err);
          navigate("/login");
        } finally {
          setLoading(false);
        }
      };
  
      fetchProfile();
    }, [navigate]);
  
    if (loading) {
      return <div>Loading...</div>;
    }

  return (
    <div className="min-h-screen flex flex-col items-center overflow-x-hidden relative">
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
       <header className="w-full flex justify-between items-center px-4 sm:px-5 py-3 sm:py-4 text-white fixed top-0 left-0 z-10 bg-black/60">
                <h2 className="text-xl sm:text-2xl font-bold">PesScore</h2>
                <Link
                    to="/"
                    className="bg-white/20 hover:bg-white/40 text-white font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition text-sm sm:text-base"
                >
                    Back to Home
                </Link>
            </header>
      <main className="flex flex-col items-center w-full px-5 pb-10">
      <div className="pt-28 w-full max-w-md">
        <div className="bg-white/20 backdrop-blur-md text-white rounded-2xl shadow-lg p-6 space-y-4">
          <h2 className="text-xl font-bold mb-4">User Profile</h2>

          {user ? (
            <>
              <div>
                <p className="text-sm text-gray-300">Full Name:</p>
                <p className="text-lg font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-300">Account Name:</p>
                <p className="text-lg font-medium">{user.account_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-300">Email:</p>
                <p className="text-lg font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-300">Date Created:</p>
                <p className="text-lg font-medium">{new Date(user.created_at).toLocaleString()}</p>
              </div>
              <button
                disabled
                className="mt-4 w-full bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg cursor-not-allowed opacity-60"
              >
                Update Info (coming soon)
              </button>
            </>
          ) : (
            <p>Loading profile...</p>
          )}
        </div>
      </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-800 to-blue-700 text-white w-full text-center py-4 mt-auto text-sm backdrop-blur-sm">
        PesScore © 2025 - Football Match Tracker
      </footer>
    </div>
  );
}

export default Profil;
