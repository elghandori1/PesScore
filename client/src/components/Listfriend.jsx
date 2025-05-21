import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import footballBg from "../assets/images/efootbalBG3.png";

function Listfriend() {
    const [activeTab, setActiveTab] = useState("users");
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [matchCount, setMatchCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [alert, setAlert] = useState({ message: '', type: '' });
    const navigate = useNavigate();

    const tabs = [
        { id: "users", label: "List Friends" },
        { id: "pending", label: "Pending Friends" },
    ];

    const handleApiError = (err) => {
        if (err.response?.status === 401) {
            navigate("/login");
        } else {
            console.error("API error:", err);
            setAlert({
                message: 'An error occurred. Please try again.',
                type: 'error'
            });
            setTimeout(() => setAlert({ message: '', type: '' }), 3000);
        }
    };
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [friendsRes, pendingRes, matchRes] = await Promise.all([
                    axios.get("http://localhost:5000/friends", { withCredentials: true }),
                    axios.get("http://localhost:5000/friend-requests", { withCredentials: true }),
                    axios.get("http://localhost:5000/match-requests", { withCredentials: true })
                ]);

                // Extract current user ID (you can get it from auth or session)
                const currentUserRes = await axios.get("http://localhost:5000/auth", {
                    withCredentials: true,
                });
                const currentUserId = currentUserRes.data.user?.id;

                // Map which friends have sent pending matches
                const pendingMatches = matchRes.data.pendingMatch || [];
                const friendHasPendingMatch = {};

                pendingMatches.forEach(match => {
                    const opponentId =
                        match.user1_id === currentUserId ? match.user2_id : match.user1_id;

                    // Only mark as dot if this is a match between current user and the friend
                    if (opponentId) {
                        friendHasPendingMatch[opponentId] = true;
                    }
                });

                // Add hasPendingMatch flag to each friend
                const friendsWithDot = friendsRes.data.friends.map(friend => ({
                    ...friend,
                    hasPendingMatch: !!friendHasPendingMatch[friend.id]
                }));

                setFriends(friendsWithDot);
                setPendingRequests(pendingRes.data.pendingRequests);
                setMatchCount(pendingMatches.length);

            } catch (err) {
                handleApiError(err);
            }
        };

        const fetchTabData = async () => {
            try {
                if (activeTab === "users") {
                    const res = await axios.get("http://localhost:5000/friends", {
                        withCredentials: true,
                    });
                    setFriends(res.data.friends.map(f => ({ ...f, hasPendingMatch: false })));
                } else if (activeTab === "pending") {
                    const res = await axios.get("http://localhost:5000/friend-requests", {
                        withCredentials: true,
                    });
                    setPendingRequests(res.data.pendingRequests);
                }
            } catch (err) {
                handleApiError(err);
            }
        };

        if (friends.length === 0 && pendingRequests.length === 0) {
            fetchInitialData();
        } else {
            fetchTabData();
            fetchInitialData();
        }
    }, [activeTab, navigate]);

    const acceptFriend = async (id) => {
        try {
            await axios.post(
                "http://localhost:5000/accept-request",
                { requesterId: id },
                { withCredentials: true }
            );

            setAlert({
                message: 'Friend request accepted successfully!',
                type: 'success'
            });
            setTimeout(() => setAlert({ message: '', type: '' }), 3000);

            // Refresh data
            const [friendsRes, pendingRes] = await Promise.all([
                axios.get("http://localhost:5000/friends", { withCredentials: true }),
                axios.get("http://localhost:5000/friend-requests", { withCredentials: true })
            ]);

            setFriends(friendsRes.data.friends);
            setPendingRequests(pendingRes.data.pendingRequests);
        } catch (err) {
            handleApiError(err);
        }
    };

    const removeFriend = async (friendId) => {
        try {
            await axios.delete("http://localhost:5000/remove-friend", {
                data: { friendId },
                withCredentials: true,
            });

            setFriends(prev => prev.filter(f => f.id !== friendId));
            setAlert({
                message: 'Friend removed successfully',
                type: 'error'
            });
            setTimeout(() => setAlert({ message: '', type: '' }), 3000);
        } catch (err) {
            handleApiError(err);
        }
    };

    const rejectFriend = async (requesterId) => {
        try {
            await axios.delete("http://localhost:5000/reject-friend", {
                data: { friendId: requesterId },
                withCredentials: true,
            });

            setPendingRequests(prev => prev.filter(r => r.id !== requesterId));
            setAlert({
                message: 'Friend request rejected',
                type: 'error'
            });
            setTimeout(() => setAlert({ message: '', type: '' }), 3000);
        } catch (err) {
            handleApiError(err);
        }
    };
    const filteredFriends = friends.filter((friend) =>
        friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.account_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            {alert.message && (
                <div
                    className={`fixed top-5 left-1/2 transform -translate-x-1/2 max-w-[400px] min-w-[250px] px-6 py-4 rounded font-bold text-center z-[1000] transition-opacity duration-300 border-l-4 shadow-lg ${alert.type === "success"
                        ? "bg-[#e8f5e9] text-[#2e7d32] border-[#2e7d32]"
                        : "bg-red-100 text-red-800 border-red-600"
                        }`}
                >
                    {alert.message}
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
            <main className="flex flex-col items-center w-full px-2 xs:px-3 sm:px-4 md:px-5 pt-20 sm:pt-18 md:pt-24 pb-4 sm:pb-8 md:pb-10">
                <section className="bg-white p-3 xs:p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg text-center w-full max-w-md sm:max-w-xl">
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
                                {/* Notification dot */}
                                {(tab.id === "users" && (matchCount > 0)) && (
                                    <span className="ml-1 inline-block w-2 h-2 sm:w-2 sm:h-2 bg-red-500 rounded-full"></span>
                                )}
                                {tab.id === "pending" && pendingRequests.length > 0 && (
                                    <span className="ml-1 inline-block w-2 h-2 sm:w-2 sm:h-2 bg-red-500 rounded-full"></span>
                                )}
                            </li>
                        ))}
                    </ul>

                    <div className="space-y-1.5 sm:space-y-2">
                        {activeTab === "users" && (
                            <div className="flex flex-col gap-1.5 sm:gap-2.5 text-left">
                                <div className="flex justify-between items-center w-full mb-2">
                                    {/* Total Friends Count - Left Side */}
                                    <p className="text-gray-700 font-medium sm:font-semibold text-xs xs:text-sm sm:text-base whitespace-nowrap">
                                        Total: <span className="text-blue-600">{friends ? (friends.length) : (0)}</span>
                                    </p>

                                    {/* Search Input - Right Side */}
                                    <div className="relative flex-grow max-w-md ml-4">
                                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                            <svg
                                                className="h-5 w-5 text-gray-400"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            placeholder="Search friends..."
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="block w-full pl-10 pr-10 py-2.5 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-all duration-150"
                                            name="searchFriend"
                                            id="searchFriend"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                aria-label="Clear search"
                                            >
                                                <svg
                                                    className="h-5 w-5 text-gray-400 hover:text-gray-600"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <hr className="border-gray-200 my-1 sm:my-2" />
                                <div className="max-h-[380px] overflow-y-auto">
                                    {searchQuery ? (
                                        filteredFriends.length === 0 ? (
                                            <p className="text-gray-500 text-center py-2 text-sm sm:text-base">
                                                No friends found matching "{searchQuery}"
                                            </p>
                                        ) : (
                                            filteredFriends.map((friend) => (
                                                <Link
                                                    to={`/Details-friend/${friend.id}`}
                                                    key={friend.id}
                                                    className="px-2.5 my-2.5 xs:px-3 py-1.5 flex items-center justify-between bg-gray-100 hover:bg-gray-200 rounded sm:rounded-md shadow-sm transition"
                                                >
                                                    <div className="truncate pr-2">
                                                        <p className="font-medium sm:font-semibold text-sm sm:text-base truncate">{friend.name} </p>
                                                        <p className="text-xs sm:text-sm text-gray-500 truncate">@{friend.account_name}</p>
                                                    </div>
                                                    {friend.isRemovalRequestedByMe ? (
                                                        <div className="text-red-600 text-xs">Request Sent</div>
                                                    ) : friend.hasPendingRemovalRequest ? (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleAcceptRemove(friend.id)}
                                                                className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectRemove(friend.id)}
                                                                className="px-2 py-1 bg-gray-500 text-white rounded text-xs"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                requestRemoveFriend(friend.id);
                                                            }}
                                                            className="text-red-500 font-bold px-2 py-0.5 rounded hover:text-red-700 hover:bg-red-50 transition text-xs xs:text-sm"
                                                        >
                                                            Cancel Friendship
                                                        </button>
                                                    )}
                                                </Link>
                                            ))
                                        )
                                    ) : friends.length === 0 ? (
                                        <p className="text-gray-500 text-center py-2 text-sm sm:text-base">No friends yet.</p>
                                    ) : (
                                        friends.map((friend) => (
                                            <Link
                                                to={`/Details-friend/${friend.id}`}
                                                key={friend.id}
                                                className="px-2.5 my-2.5 xs:px-3 py-1.5 flex items-center justify-between bg-gray-100 hover:bg-gray-200 rounded sm:rounded-md shadow-sm transition"
                                            >
                                                <div className="truncate pr-2">
                                                    <p className="font-medium sm:font-semibold text-sm sm:text-base truncate relative">
                                                        {friend.name}
                                                        {friend.hasPendingMatch && (
                                                            <span className="ml-1 inline-block w-2 h-2 sm:w-2 sm:h-2 bg-red-500 rounded-full"></span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs sm:text-sm text-gray-500 truncate">@{friend.account_name}</p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        removeFriend(friend.id);
                                                    }}
                                                    className="text-red-500 font-bold px-2 py-0.5 rounded hover:text-red-700 hover:bg-red-50 transition text-xs xs:text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </Link>
                                        ))
                                    )}
                                </div>
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
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => acceptFriend(request.id)}
                                                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-0.5 rounded text-xs xs:text-sm transition"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button onClick={() => rejectFriend(request.id)}
                                                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-0.5 rounded text-xs xs:text-sm transition"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
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
    )
}
export default Listfriend;