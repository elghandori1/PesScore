import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import footballBg from "../assets/images/efootbalBG3.png";

function Addfriend() {
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [alert, setAlert] = useState({ message: "", type: "" });
  const navigate = useNavigate();

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => {
            setAlert({ message: "", type: "" });
        }, 4000);
    };
    const handleSearch = async () => {
        if (search.trim() === "") {
          showAlert("Search input is empty", "error");
          return;
        }
        try {
          const res = await axios.get("http://localhost:5000/search-users", {
            params: { query: search },
            withCredentials: true,
          });
          setUsers(res.data.users);
          setHasSearched(true);
        } catch (err) {
          if (err.response?.status === 401) {
            navigate("/login");
          } else {
            console.error("Search error:", err);
            showAlert("An error occurred while searching", "error");
            setHasSearched(true);
          }
        }
      };
    
      const fetchPendingRequests = async () => {
        try {
          const res = await axios.get("http://localhost:5000/pending-requests", {
            withCredentials: true,
          });
          setPendingRequests(res.data.pending);
        } catch (err) {
          if (err.response?.status === 401) {
            navigate("/login");
          } else {
            console.error("Pending request fetch error:", err);
          }
        }
      };
    
      const sendFriendRequest = async (friendId) => {
        try {
          const res = await axios.post(
            "http://localhost:5000/send-request",
            { friend_id: friendId },
            { withCredentials: true }
          );
          fetchPendingRequests();
          setUsers((prev) => prev.filter((u) => u.id !== friendId));
          setSearch("");
          showAlert(res.data.message, "success");
          setHasSearched(false);
        } catch (err) {
          if (err.response?.status === 401) {
            navigate("/login");
          } else {
            const errorMessage = err.response?.data?.message || "Failed to send request";
            console.error("Error sending request:", err);
            showAlert(errorMessage, "error");
          }
        }
      };
    
      const handleCancelRequest = async (friendId) => {
        try {
          await axios.delete(`http://localhost:5000/friendships/${friendId}`, {
            withCredentials: true,
          });
          fetchPendingRequests();
        } catch (err) {
          if (err.response?.status === 401) {
            navigate("/login");
          } else {
            const errorMessage = err.response?.data?.message || "Failed to cancel request";
            console.error("Failed to cancel request:", err);
            showAlert(errorMessage, "error");
          }
        }
      };
    
      useEffect(() => {
        fetchPendingRequests();
      }, []);
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
            <header className="w-full flex justify-between items-center px-4 sm:px-5 py-3 sm:py-4 text-white fixed top-0 left-0 z-10 bg-black/60">
                <h2 className="text-xl sm:text-2xl font-bold">PesScore</h2>
                <Link
                    to="/"
                    className="bg-white/20 hover:bg-white/40 text-white font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition text-sm sm:text-base"
                >
                    Back to Home
                </Link>
            </header>
            {/* Main Content */}
            <main className="flex flex-col items-center w-full px-3 sm:px-4 md:px-5 pt-16 sm:pt-20 pb-8 sm:pb-10">
                <section className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg text-center max-w-xl w-full backdrop-blur-sm">
                    <h2 className="text-xl sm:text-2xl mb-3 sm:mb-4 text-blue-600 font-semibold">Add a new friend</h2>

                    {/* Search Section */}
                    <div className="flex items-center gap-2 mb-4 w-full">
                        <input
                            type="text"
                            placeholder="Search user..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 min-w-0 px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400 text-sm sm:text-base"
                        />
                        <button
                            onClick={handleSearch}
                            className="bg-blue-600 text-white p-2 sm:px-3 sm:py-2 rounded-lg hover:bg-blue-700 transition flex-shrink-0"
                            aria-label="Search"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 sm:h-5 sm:w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* User List */}
                    <div className="flex flex-col gap-2 sm:gap-3 text-left">
                        {users.length > 0 ? (
                            users.map((user) => (
                                <div
                                    key={user.id}
                                    className="w-full sm:w-4/5 flex justify-between items-center bg-gray-200 px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg shadow-sm"
                                >
                                    <span className="font-medium text-sm sm:text-base">{user.account_name}</span>
                                    <button
                                        onClick={() => sendFriendRequest(user.id)}
                                        className="text-blue-500 hover:text-blue-600 transition p-1 sm:p-2 rounded-full hover:bg-blue-200"
                                        aria-label="Send friend request"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                        </svg>
                                    </button>
                                </div>
                            ))
                        ) : hasSearched ? (
                            <p className="text-gray-500 text-sm sm:text-base">No users found</p>
                        ) : null}

                        {/* Pending Requests Section */}
                        <p className="text-gray-700 font-semibold mt-2 sm:mt-4 text-sm sm:text-base">
                            Pending requests ({pendingRequests ? pendingRequests.length : 0})
                        </p>
                        <hr className="border-gray-300"/>

                        {pendingRequests.length === 0 ? (
                            <p className="text-gray-500 text-sm sm:text-base">No pending requests</p>
                        ) : (
                            <div className="max-h-[280px] overflow-y-auto pr-2">
                                {pendingRequests.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex justify-between items-center bg-red-100 px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg shadow-sm mb-2"
                                    >
                                        <span className="font-medium text-sm sm:text-base">{user.account_name}</span>
                                        <button onClick={() => handleCancelRequest(user.id)}
                                            className="text-red-500 font-black p-1 sm:px-2 sm:py-1 rounded-lg hover:text-red-700 transition flex-shrink-0 text-sm sm:text-base"
                                            aria-label="Cancel request"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            {/* Footer */}
            <footer className="bg-gradient-to-r from-blue-800 to-blue-700 text-white w-full text-center py-4 mt-auto text-sm backdrop-blur-sm">
                PesScore © 2025 - Football Match Tracker
            </footer>
        </div>
    );
}
export default Addfriend;