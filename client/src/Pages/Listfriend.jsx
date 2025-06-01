import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import footballBg from "../assets/images/efootbalBG5.png";

function Listfriend() {
  const [activeTab, setActiveTab] = useState("friends");
  const [pendingSubTab, setPendingSubTab] = useState("receivedRequests");
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [pendingSentRequests, setPendingSentRequests] = useState([]);
  const [pendingReceivedRequests, setPendingReceivedRequests] = useState([]);
  const [pendingMatches, setPendingMatches] = useState({}); // Maps friend IDs to pending/rejected match count
  const [deletionRequests, setDeletionRequests] = useState({}); // Add this line
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Clear error/success messages after 3 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Fetch friend data and pending/rejected matches
  const fetchFriendData = async () => {
    setLoading(true);
    try {
      const friendsRes = await axios.get("http://localhost:5000/friends/list-friends", {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      const currentUserRes = await axios.get("http://localhost:5000/auth/check-auth", {
        withCredentials: true,
      });
      setUserId(currentUserRes.data.user?.id);
      setFriends(friendsRes.data.friends);
      setFilteredFriends(friendsRes.data.friends);

      const sentRes = await axios.get("http://localhost:5000/friends/pending-friend-requests/sent", {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      setPendingSentRequests(sentRes.data.pendingSentRequests);

      const receivedRes = await axios.get("http://localhost:5000/friends/pending-friend-requests/received", {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      setPendingReceivedRequests(receivedRes.data.pendingReceivedRequests);

      // Fetch pending matches where the current user is the receiver
      const pendingMatchesRes = await axios.get("http://localhost:5000/matches/pending-matches/received", {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      // Fetch rejected matches where the current user is the sender
      const rejectedMatchesRes = await axios.get("http://localhost:5000/matches/rejected-matches/sent", {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      // Combine pending and rejected matches
      const combinedMatches = { ...pendingMatchesRes.data.pendingMatches };
      for (const [friendId, count] of Object.entries(rejectedMatchesRes.data.rejectedMatches)) {
        combinedMatches[friendId] = (combinedMatches[friendId] || 0) + count;
      }
      setPendingMatches(combinedMatches);

      // Add this new fetch for deletion requests
      const deletionRequestsRes = await axios.get("http://localhost:5000/matches/deletion-requests", {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      // Process deletion requests to count by friend
      const requestsByFriend = {};
      deletionRequestsRes.data.requests.forEach(request => {
        const friendId = request.requested_by === userId ? 
          (request.player1_id === userId ? request.player2_id : request.player1_id) :
          request.requested_by;
        requestsByFriend[friendId] = (requestsByFriend[friendId] || 0) + 1;
      });
      setDeletionRequests(requestsByFriend);
    } catch (err) {
      console.error("Fetch friend data error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(err.response?.data?.error || "Failed to fetch friend data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendData();
  }, []);

  // Handle search input changes
  useEffect(() => {
    const filtered = friends.filter((friend) =>
      friend.name_account.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredFriends(filtered);
  }, [searchQuery, friends]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    fetchFriendData(); // Re-fetch data when switching tabs
  };

  const handlePendingSubTabSwitch = (subTab) => {
    setPendingSubTab(subTab);
  };

  // Handle remove friend
  const handleRemoveFriend = async (friendId) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/friends/remove-friend/${friendId}`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      setSuccess(response.data.message);
      await fetchFriendData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to initiate friend removal");
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel removal
  const handleCancelRemoval = async (friendId) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/friends/cancel-removal/${friendId}`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      setSuccess(response.data.message);
      await fetchFriendData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to cancel friend removal");
    } finally {
      setLoading(false);
    }
  };

  // Handle accept removal
  const handleAcceptRemoval = async (friendId) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/friends/accept-removal/${friendId}`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      setSuccess(response.data.message);
      await fetchFriendData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to accept friend removal");
    } finally {
      setLoading(false);
    }
  };

  // Handle reject removal
  const handleRejectRemoval = async (friendId) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/friends/reject-removal/${friendId}`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      setSuccess(response.data.message);
      await fetchFriendData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reject friend removal");
    } finally {
      setLoading(false);
    }
  };

  // Handle reject friend request
  const handleRejectFriendRequest = async (requestId) => {
    setLoading(true);
    try {
      const response = await axios.delete(
        `http://localhost:5000/friends/reject-friend-request/${requestId}`,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      setSuccess(response.data.message);
      await fetchFriendData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reject friend request");
    } finally {
      setLoading(false);
    }
  };

  // Handle accept friend request
  const handleAcceptFriendRequest = async (requestId) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/friends/accept-friend-request/${requestId}`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      setSuccess(response.data.message);
      await fetchFriendData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to accept friend request");
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel friend request
  const handleCancelFriendRequest = async (requestId) => {
    setLoading(true);
    try {
      const response = await axios.delete(
        `http://localhost:5000/friends/cancel-friend-request/${requestId}`,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      setSuccess(response.data.message);
      await fetchFriendData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to cancel friend request");
    } finally {
      setLoading(false);
    }
  };

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
          backgroundAttachment: "fixed"
        }}
      />
      
      {/* Header */}
      <header className="w-full flex flex-row justify-between items-center px-2 py-2 sm:px-4 sm:py-3 text-white fixed z-30 bg-black/70 backdrop-blur-sm">
        <h2 className="text-lg sm:text-2xl font-bold tracking-tight">PesScore</h2>
        <Link 
          to="/"
          className="bg-white/20 hover:bg-white/40 text-white font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition text-xs sm:text-base flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>
      </header>
    
      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center min-h-screen pt-16 pb-24 px-2 sm:px-4">
        <section className="bg-white/90 backdrop-blur-sm p-3 sm:p-6 rounded-xl shadow-xl w-full max-w-lg sm:max-w-2xl mx-auto">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-700 mb-1 sm:mb-2">Friends Management</h2>
            <p className="text-gray-600 text-xs sm:text-sm">Connect and manage your football friends</p>
          </div>
    
          {/* Feedback Messages */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4 text-sm">
              {success}
            </div>
          )}
    
          {/* Tabs */}
          <div className="flex flex-row flex-wrap justify-around border-b border-gray-200 mb-4 sm:mb-5">
            <button
              className={`py-2 px-4 font-medium text-xs sm:text-base flex items-center gap-2 ${
                activeTab === "friends" 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabSwitch("friends")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
              </svg>
              Friends
              {activeTab === "friends" && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  {filteredFriends.length}
                </span>
              )}
            </button>
            
            <button
              className={`py-2 px-4 font-medium text-xs sm:text-base flex items-center gap-2 ${
                activeTab === "pending" 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabSwitch("pending")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
              Pending
              {pendingReceivedRequests.length > 0 && (
               <span className="ml-1 inline-block w-2 h-2 sm:w-2 sm:h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
          <hr className="border-gray-300 w-1/2 mx-auto" />     
          {/* Search Input - Only shown in friends tab */}
          {activeTab === "friends" && (
            <div className="relative mb-3 sm:mb-5">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-base"
              />
            </div>
          )}
    
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-8">
              <svg className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
    
          {/* Friends Tab Content */}
          {!loading && activeTab === "friends" && (
            <div className="max-h-[330px] overflow-y-auto space-y-2">
              {filteredFriends.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="mt-2 text-base sm:text-lg font-medium text-gray-900">
                    {searchQuery ? "No friends match your search" : "No friends yet"}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    {searchQuery ? "Try a different search term" : "Add friends to start tracking matches together"}
                  </p>
                </div>
              ) : (
                filteredFriends.map((friend) => (
                  <div 
                    key={friend.id} 
                    className={`flex items-center justify-between p-3 sm:p-4 rounded-lg ${
                      friend.status === "pending_removal" ? "bg-red-100 border border-red-100" : "bg-white border border-gray-100"
                    } shadow-sm hover:shadow-md transition-shadow hover:bg-gray-100`}
                  >
                    <Link 
                      to={`/Details-friend/${friend.id}`} 
                      className="flex items-center space-x-3 sm:space-x-4 flex-1 w-full"
                    >
                      <div className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          <span>{friend.name_account}</span>
                          {((pendingMatches[friend.id] || 0) > 0 || (deletionRequests[friend.id] || 0) > 0) && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {(pendingMatches[friend.id] || 0) + (deletionRequests[friend.id] || 0)} pending
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500">
                          Added: {new Date(friend.created_at).toLocaleDateString()}
                        </p>
                        {friend.status === "pending_removal" && (
                          <p className="text-[10px] sm:text-xs mt-1 text-red-600">
                            {friend.requested_by === userId
                              ? "You requested to remove this friend"
                              : "This friend wants to remove you"}
                          </p>
                        )}
                      </div>
                    </Link>
                    
                    <div className="mt-2 sm:mt-0 ml-0 sm:ml-4 flex-shrink-0 flex flex-row gap-2">
                      {friend.status === "pending_removal" ? (
                        friend.requested_by === userId ? (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleCancelRemoval(friend.id);
                            }}
                            className="inline-flex items-center px-2.5 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          >
                            Cancel
                          </button>
                        ) : (
                          <div className="flex flex-row space-x-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleAcceptRemoval(friend.id);
                              }}
                              className="inline-flex items-center px-2.5 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Accept
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleRejectRemoval(friend.id);
                              }}
                              className="inline-flex items-center px-2.5 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                              Reject
                            </button>
                          </div>
                        )
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemoveFriend(friend.id);
                          }}
                          className="inline-flex items-center px-2.5 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
    
          {/* Pending Tab Content */}
          {!loading && activeTab === "pending" && (
            <div>
              {/* Pending Sub-tabs */}
              <div className="flex flex-row flex-wrap justify-center border-b border-gray-200 mb-4 sm:mb-5 mt-2">
                <button
                  className={`py-2 px-4 font-medium text-xs sm:text-base flex items-center gap-2 ${
                    pendingSubTab === "receivedRequests" 
                      ? "text-blue-600 border-b-2 border-blue-600" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handlePendingSubTabSwitch("receivedRequests")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Received
                  {pendingReceivedRequests.length > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                      {pendingReceivedRequests.length}
                    </span>
                  )}
                </button>
                
                <button
                  className={`py-2 px-4 font-medium text-xs sm:text-base flex items-center gap-2 ${
                    pendingSubTab === "sentRequests" 
                      ? "text-blue-600 border-b-2 border-blue-600" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handlePendingSubTabSwitch("sentRequests")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                  Sent
                  {pendingSentRequests.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                      {pendingSentRequests.length}
                    </span>
                  )}
                </button>
              </div>
    
              {/* Received Requests */}
              {pendingSubTab === "receivedRequests" && (
                <div className="max-h-[330px] overflow-y-auto space-y-2">
                  {pendingReceivedRequests.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <h3 className="mt-2 text-base sm:text-lg font-medium text-gray-900">No received requests</h3>
                      <p className="mt-1 text-xs sm:text-sm text-gray-500">Friend requests you receive will appear here</p>
                    </div>
                  ) : (
                    pendingReceivedRequests.map((request) => (
                      <div key={request.id} className="flex sm:flex-row items-center justify-between p-3 sm:p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-900">{request.name_account}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500">Requested: {new Date(request.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex flex-row gap-2 mt-2 sm:mt-0">
                          <button
                            onClick={() => handleAcceptFriendRequest(request.id)}
                            className="inline-flex items-center px-2.5 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectFriendRequest(request.id)}
                            className="inline-flex items-center px-2.5 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
    
              {/* Sent Requests */}
              {pendingSubTab === "sentRequests" && (
                <div className="max-h-[330px] overflow-y-auto space-y-2">
                  {pendingSentRequests.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <h3 className="mt-2 text-base sm:text-lg font-medium text-gray-900">No sent requests</h3>
                      <p className="mt-1 text-xs sm:text-sm text-gray-500">Friend requests you send will appear here</p>
                    </div>
                  ) : (
                    pendingSentRequests.map((request) => (
                      <div key={request.id} className="flex sm:flex-row items-center justify-between p-3 sm:p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-900">{request.name_account}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500">Sent: {new Date(request.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCancelFriendRequest(request.id)}
                          className="inline-flex items-center px-2.5 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mt-2 sm:mt-0"
                        >
                          Cancel
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    
      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-gradient-to-r from-blue-800 to-blue-700 text-white text-center py-2 xs:py-4 z-10 backdrop-blur-sm">
      <div className="container mx-auto px-2 xs:px-4">
        <p className="text-xs xs:text-sm sm:text-base">
          PesScore © 2025 - Football Match Tracker
        </p>
      </div>
    </footer>
    </div>
  );
}

export default Listfriend;