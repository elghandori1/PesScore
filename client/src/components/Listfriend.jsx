import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import footballBg from "../assets/images/efootbalBG3.png";

function Listfriend() {
    const [activeTab, setActiveTab] = useState("users");
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const navigate = useNavigate();
    const tabs = [
        { id: "users", label: "List Users" },
        { id: "pending", label: "Pending Requests" },
        { id: "notifications", label: "Notifications" },
    ];

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await axios.get("http://localhost:5000/friends", {
                    withCredentials: true,
                });
                setFriends(res.data.friends);
            } catch (err) {
                if (err.response?.status === 401) {
                    navigate("/login");
                } else {
                    console.error("Failed to fetch friends:", err);
                }
            }
        };

        const fetchPendingRequests = async () => {
            try {
                const res = await axios.get("http://localhost:5000/friend-requests", {
                    withCredentials: true,
                });
                setPendingRequests(res.data.pendingRequests);
            } catch (err) {
                if (err.response?.status === 401) {
                    navigate("/login");
                } else {
                    console.error("Failed to fetch pending requests:", err);
                }
            }
        };

        if (activeTab === "users") {
            fetchFriends();
        } else if (activeTab === "pending") {
            fetchPendingRequests();
        }

        fetchPendingRequests();

    }, [activeTab]);


    const acceptFriend = async (id) => {
        try {
            await axios.post(
                "http://localhost:5000/accept-request",
                { requesterId: id },
                { withCredentials: true }
            );
            setActiveTab("users");
        } catch (err) {
            console.error("Accept failed", err);
        }
    };

    const removeFriend = async (friendId) => {
        try {
            await axios.delete("http://localhost:5000/remove-friend", {
                data: { friendId },
                withCredentials: true,
            });

            setFriends((prev) => prev.filter((f) => f.id !== friendId));
        } catch (err) {
            console.error("Failed to remove friend:", err);
        }
    };

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
            {/* Main Content */}
            <main className="flex flex-col items-center w-full px-2 xs:px-3 sm:px-4 md:px-5 pt-14 sm:pt-18 md:pt-20 pb-4 sm:pb-8 md:pb-10">
                <section className="bg-white p-3 xs:p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg text-center w-full max-w-md sm:max-w-xl">
                    {/* Tabs - Improved mobile sizing */}

                    <ul className="flex justify-between bg-white rounded-md sm:rounded-lg overflow-hidden border border-gray-200 sm:border-gray-300 mb-3 sm:mb-4">
                        {tabs.map((tab) => (
                            <li
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-3 xs:py-2 text-xs xs:text-sm font-medium cursor-pointer transition-all ${activeTab === tab.id
                                        ? "text-white bg-gradient-to-r from-blue-700 to-blue-600 sm:from-blue-800 sm:to-blue-700"
                                        : "text-gray-700 bg-white hover:bg-gray-50"
                                    }`}
                            >
                                {tab.label}
                                {/* Notification dot for Pending Requests */}
                                {tab.id === "pending" && pendingRequests.length > 0 && (
                                    <span className="ml-0.5 sm:top-2 sm:right-2 inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full"></span>
                                )}


                            </li>
                        ))}
                    </ul>

                    {/* Content Based on Tab */}
                    <div className="space-y-1.5 sm:space-y-2">
                        {activeTab === "users" && (
                            <div className="flex flex-col gap-1.5 sm:gap-2.5 text-left">
                                {friends.length === 0 ? (
                                    <p className="text-gray-500 text-center py-2 text-sm sm:text-base">No friends yet.</p>
                                ) : (
                                    <>
                                        <hr className="border-gray-200 my-1 sm:my-2" />
                                        <p className="text-gray-700 text-left font-medium sm:font-semibold text-xs xs:text-sm sm:text-base">
                                            Total: {friends.length}
                                        </p>
                                        {friends.map((friend) => (
                                            <div
                                                key={friend.id}
                                                className="px-2.5 xs:px-3 py-1.5 flex items-center justify-between bg-gray-100 hover:bg-gray-200 rounded sm:rounded-md shadow-sm transition"
                                            >
                                                <div className="truncate pr-2">
                                                    <p className="font-medium sm:font-semibold text-sm sm:text-base truncate">{friend.name}</p>
                                                    <p className="text-xs sm:text-sm text-gray-500 truncate">@{friend.account_name}</p>
                                                </div>
                                                <button onClick={() => removeFriend(friend.id)} className="text-red-500 font-bold px-2 py-0.5 rounded hover:text-red-700 hover:bg-red-50 transition text-xs xs:text-sm">
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === "pending" && (
                            <div className="flex flex-col gap-1.5 sm:gap-2.5 text-left">
                                {pendingRequests.length === 0 ? (
                                    <p className="text-gray-500 text-center py-2 text-sm sm:text-base">No pending requests.</p>
                                ) : (
                                    <>
                                        <hr className="border-gray-200 my-1 sm:my-2" />
                                        <p className="text-gray-700 text-left font-medium sm:font-semibold text-xs xs:text-sm sm:text-base">
                                            Total: {pendingRequests.length}
                                        </p>
                                        {pendingRequests.map((request) => (
                                            <div
                                                key={request.id}
                                                className="px-2.5 xs:px-3 py-1.5 flex items-center justify-between bg-yellow-100 rounded sm:rounded-md shadow-sm transition"
                                            >
                                                <div className="truncate pr-2">
                                                    <p className="font-medium sm:font-semibold text-sm sm:text-base truncate">{request.name}</p>
                                                    <p className="text-xs sm:text-sm text-gray-600 truncate">@{request.account_name}</p>
                                                </div>
                                                <button
                                                    onClick={() => acceptFriend(request.id)}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-0.5 rounded text-xs xs:text-sm transition"
                                                >
                                                    Accept
                                                </button>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === "notifications" && (
                            <p className="text-gray-500 py-2 text-sm sm:text-base">No notifications yet.</p>
                        )}
                    </div>
                </section>
            </main>
            {/* Footer */}
            <footer className="bg-gradient-to-r from-blue-800 to-blue-700 text-white w-full text-center py-4 mt-auto text-sm backdrop-blur-sm">
                PesScore © 2025 - Football Match Tracker
            </footer>
        </div>
    )
}
export default Listfriend;