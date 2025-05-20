import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import footballBg from "../assets/images/efootbalBG3.png";
import axios from "axios";

function Detailsfriend() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [friend, setFriend] = useState(null);
  const [matches, setMatches] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("history");
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [pendingRefresh, setPendingRefresh] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [userRes, friendRes, matchesRes] = await Promise.all([
          axios.get('http://localhost:5000/auth', { withCredentials: true }),
          axios.get(`http://localhost:5000/friends-score/${id}`, { withCredentials: true }),
          axios.get(`http://localhost:5000/matches-score/${id}/`, { withCredentials: true })
        ]);

        if (isMounted) {
          setCurrentUserId(userRes.data.user?.id);
          setFriend(friendRes.data.friend);
          setMatches(matchesRes.data.matches);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          console.error("Error fetching data:", err);
          showAlert('Failed to load data', 'error');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [id, navigate]);

  useEffect(() => {
    if (pendingRefresh) {
      const fetchPendingMatches = async () => {
        try {
          setIsLoading(true);
          const res = await axios.get(`http://localhost:5000/matches-score/${id}/`, {
            withCredentials: true,
          });
          setMatches(res.data.matches);
        } catch (err) {
          console.error("Failed to refresh matches:", err);
          showAlert('Failed to refresh matches', 'error');
        } finally {
          setPendingRefresh(false);
          setIsLoading(false);
        }
      };
      fetchPendingMatches();
    }
  }, [pendingRefresh, id]);

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: '', type: '' }), 3000);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "pending") {
      setPendingRefresh(true);
    }
  };

  const handleCancelMatch = async (matchId) => {
    try {
      await axios.delete(
        `http://localhost:5000/matches/${matchId}/cancel`,
        { withCredentials: true }
      );
      setPendingRefresh(true);
      showAlert('Match request canceled', 'error');
    } catch (err) {
      console.error("Failed to cancel match:", err);
      showAlert('Failed to cancel match', 'error');
    }
  };

  const handleAcceptMatch = async (matchId) => {
    try {
      await axios.post(
        `http://localhost:5000/matches/${matchId}/accept`,
        {},
        { withCredentials: true }
      );
      setPendingRefresh(true);
      showAlert('Match accepted successfully', 'success');
    } catch (err) {
      console.error("Failed to accept match:", err);
      showAlert('Failed to accept match', 'error');
    }
  };

  const handleRejectMatch = async (matchId) => {
    try {
      await axios.post(
        `http://localhost:5000/matches/${matchId}/reject`,
        {},
        { withCredentials: true }
      );
      setPendingRefresh(true);
      showAlert('Match rejected', 'error');
    } catch (err) {
      console.error("Failed to reject match:", err);
      showAlert('Failed to reject match', 'error');
    }
  };

  if (isLoading || !friend || !currentUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const filteredMatches = matches.filter(match =>
    activeTab === "history"
      ? match.status === 'accepted'
      : match.status === 'pending'
  );

  const acceptedCount = matches.filter(m => m.status === 'accepted').length;
  const pendingCount = matches.filter(m => m.status === 'pending').length;
  const sentPendingCount = matches.filter(m =>
    m.status === 'pending' && m.requester_id === currentUserId
  ).length;
  const receivedPendingCount = matches.filter(m =>
    m.status === 'pending' && m.requester_id !== currentUserId
  ).length;

  if (!friend || !currentUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center overflow-x-hidden relative">
      {/* Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${footballBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      />

      {/* Header */}
      <header className="w-full flex justify-between items-center px-4 sm:px-5 py-3 sm:py-4 text-white fixed top-0 left-0 z-10 bg-black/60">
        <h2 className="text-xl sm:text-2xl font-bold">PesScore</h2>
        <Link
          to="/listfreind"
          className="bg-white/20 hover:bg-white/40 text-white font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition text-sm sm:text-base"
        >
          Back to Friends
        </Link>
      </header>

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

      {/* Main Content */}
      <main className="flex flex-col items-center w-full px-2 sm:px-4 pt-16 pb-6 sm:pt-20 sm:pb-8">
        <section className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-lg w-full max-w-sm sm:max-w-md md:max-w-2xl">
          <div className="mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 text-center">
              Matches with: <span className="text-blue-600">@{friend.account_name}</span>
            </h3>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <span className="text-sm md:text-base font-medium text-gray-600">
              Total: <span className="font-semibold text-blue-600">
                {activeTab === "history"
                  ? matches.filter(m => m.status === 'accepted').length
                  : matches.filter(m => m.status === 'pending').length}
              </span>
            </span>
            <Link
              to={`/newmatch/${id}`}
              className="px-4 py-2 rounded-full text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-sm md:text-base transition-all shadow-sm hover:shadow-md"
            >
              New Match +
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-3 sm:mb-4 text-sm sm:text-base">
            <button
              onClick={() => handleTabChange("history")}
              className={`flex-1 py-2 font-medium ${activeTab === "history"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              History
            </button>
            <button
              onClick={() => handleTabChange("pending")}
              className={`flex-1 py-2 font-medium ${activeTab === "pending"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Pending
              {receivedPendingCount > 0 && (
                <span className="ml-1 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Matches List */}
          <div className="max-h-[400px] overflow-y-auto">
            {filteredMatches.length === 0 ? (
              <div className="text-center py-6 text-sm sm:py-8 text-gray-500">
                {activeTab === "history"
                  ? "No match history yet"
                  : "No pending match requests"}
              </div>
            ) : (
              <ul className="space-y-3">
                {filteredMatches.map((match) => {
                  const isUser1CurrentUser = parseInt(match.user1_id) === parseInt(currentUserId);
                  const dateString = new Date(match.date_time).toLocaleDateString();

                  return (
                    <li
                      key={match.match_id}
                      className={`border rounded-lg p-3 ${activeTab === "pending" ? "bg-yellow-50" : "bg-white"}`}
                    >
                      {/* Match Content Row */}
                      {/* Match Scores */}
                      <div className="flex justify-between items-center gap-2 text-xs sm:text-sm whitespace-nowrap">
                        {/* You (Dynamic based on who is user1 or user2) */}
                        <div className="text-center flex-1 min-w-[80px]">
                          <p className="font-medium text-gray-800">You</p>
                          <p className="text-base sm:text-lg font-bold text-red-500">
                            {parseInt(match.user1_id) === parseInt(currentUserId)
                              ? match.user1_score
                              : parseInt(match.user2_id) === parseInt(currentUserId)
                                ? match.user2_score
                                : "--"}
                          </p>
                        </div>

                        {/* Center - vs or created by */}
                        <div className="text-center px-2">
                          {activeTab === "pending" ? (
                            <b className="text-blue-500 text-sm sm:text-md block">vs</b>
                          ) : (
                            <>
                              <small className="text-blue-500 text-[10px] sm:text-xs block mb-0.5">created by</small>
                              <b className="text-xs sm:text-sm">
                                {match.requester_id === currentUserId ? "Me" : friend.account_name}
                              </b>
                            </>
                          )}
                        </div>

                        {/* Friend */}
                        <div className="text-center flex-1 min-w-[80px]">
                          <p className="font-medium text-gray-800">{friend.account_name}</p>
                          <p className="text-base sm:text-lg font-bold text-red-500">
                            {parseInt(match.user1_id) === parseInt(currentUserId)
                              ? match.user2_score
                              : parseInt(match.user2_id) === parseInt(currentUserId)
                                ? match.user1_score
                                : "--"}
                          </p>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="mt-2 text-center text-[10px] sm:text-xs text-gray-500">
                        {dateString}
                      </div>

                      {/* Pending Actions */}
                      {activeTab === "pending" && (
                        <div className="flex justify-center items-center gap-3 mt-3 flex-wrap">
                          {/* Only show Cancel button if current user is the requester */}
                          {match.requester_id === currentUserId && (
                            <button
                              onClick={() => handleCancelMatch(match.match_id)}
                              className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            >
                              Cancel
                            </button>
                          )}

                          {/* Show Accept and Reject buttons only if current user is NOT the requester */}
                          {match.requester_id !== currentUserId && (
                            <>
                              <button
                                onClick={() => handleAcceptMatch(match.match_id)}
                                className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleRejectMatch(match.match_id)}
                                className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
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

export default Detailsfriend;