import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import footballBg from "../assets/images/efootbalBG5.png";

function NewFriend() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Fetch pending friend requests on mount
  useEffect(() => {
    const fetchPendingRequests = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/friends/pending-friend-requests/sent", {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });
        setPendingRequests(res.data.pendingSentRequests);
      } catch (err) {
        console.error("Fetch pending requests error:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError(err.response?.data?.error || "Failed to fetch pending friend requests");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, [navigate]);

  const handleSearch = async () => {
    if (search.trim() === "") {
      setError("الرجاء إدخال عبارة بحث");
      setSuccess("");
      setHasSearched(false);
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    setHasSearched(true);

    try {
      const res = await axios.get("http://localhost:5000/friends/search-users", {
        params: { query: search },
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      setUsers(res.data.users);
    } catch (err) {
      console.error("Search users error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(err.response?.data?.error || "An error occurred while searching");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (event, receiverId) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/friends/send-friend-request",
        { receiver_id: receiverId },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setSuccess(res.data.message);
      setUsers(users.filter(user => user.id !== receiverId));
      setHasSearched(false);
      // Refresh pending requests 
      try {
        const updatedRes = await axios.get("http://localhost:5000/friends/pending-friend-requests/sent", {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });
        setPendingRequests(updatedRes.data.pendingSentRequests);
      } catch (updateErr) {
        console.error("Update pending requests error:", {
          status: updateErr.response?.status,
          data: updateErr.response?.data,
          message: updateErr.message,
        });
        setError("فشل تحديث الطلبات المعلقة. يُرجى المحاولة مرة أخرى");
      }
    } catch (err) {
      console.error("Send friend request error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(err.response?.data?.error || "Failed to send friend request");
      }
    } finally {
      setLoading(false);
      setHasSearched(false);
    }
  };

  const handleCancelFriendRequest = async (event, requestId) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await axios.delete(`http://localhost:5000/friends/cancel-friend-request/${requestId}`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      setSuccess(res.data.message);
      setPendingRequests(pendingRequests.filter(request => request.id !== requestId));
      setHasSearched(false);
    } catch (err) {
      console.error("Cancel friend request error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(err.response?.data?.error || "Failed to cancel friend request");
      }
    } finally {
      setLoading(false);
      setHasSearched(false);
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
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">PesScore</h2>
        <Link
          to="/"
          className="font-almarai bg-white/20 hover:bg-white/40 text-white font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition text-xs sm:text-sm md:text-base flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          العودة إلى الرئيسية
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center min-h-screen pt-20 pb-24 px-2 sm:px-4">
        <section className="bg-white/90 backdrop-blur-sm p-3 sm:p-6 md:p-8 rounded-xl shadow-xl w-full max-w-md sm:max-w-xl mx-auto">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-bold text-blue-700 mb-1 font-almarai">إضافة صديق</h2>
            <p className="text-gray-600 text-xs sm:text-sm font-almarai">تواصل مع عشاق كرة القدم الآخرين</p>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="bg-red-50 text-center text-red-600 p-3 rounded-md mb-4 text-sm font-almarai">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-center text-green-600 p-3 rounded-md mb-4 text-sm font-almarai">
              {success}
            </div>
          )}

          {/* Search Section */}
          <div className="flex sm:items-center gap-2 mb-2 w-full">
            <input
              type="text"
              placeholder="ID البحث بالاسم أو معرف اللعبة"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-full px-4 sm:px-5 text-xs sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-almarai"
              disabled={loading}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-center p-2 sm:p-3 rounded-full hover:from-blue-700 hover:to-blue-600 transition-all duration-200 flex-shrink-0 shadow-md"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white text-center" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>

          {/* Search Results */}
          {hasSearched && (
            <div className="mb-3">
              <h3 className="text-base sm:text-lg text-center font-semibold text-blue-600 mb-2 font-almarai">نتائج البحث</h3>
              {users.length > 0 ? (
                <div className="max-h-[230px] overflow-y-auto space-y-2">
                  {users.map((user) => (
                    <div key={user.id} className="flex flex-row justify-between items-start sm:items-center bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100">
                      <div>
                        <p className="font-medium text-sm sm:text-base font-almarai">{user.name_account}</p>
                        <p className="text-xs sm:text-sm text-gray-500 font-almarai">ID: {user.id_account}</p>
                      </div>
                      <button
                        onClick={(e) => handleSendFriendRequest(e, user.id)}
                        className="mt-2 sm:mt-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm flex items-center gap-1 font-almarai"
                        disabled={loading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                        </svg>
                        إضافة
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 sm:py-4 text-gray-500 text-xs sm:text-base font-almarai">
                  لم يتم العثور على مستخدمين مطابقين لبحثك
                </div>
              )}
            </div>
          )}

          {/* Pending Requests Section */}
          <div className="bg-gray-50 p-3 sm:p-5 rounded-xl border border-gray-200 shadow-sm mt-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center justify-end gap-2">
              <span className="text-blue-600 font-almarai">طلبات الصداقة المعلقة ({pendingRequests.length})</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </h3>

            {pendingRequests.length > 0 ? (
              <div className="max-h-[330px] overflow-y-auto space-y-2">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex justify-between items-center bg-red-100 p-3 sm:p-4 rounded-lg">
                    <div>
                        <p className="font-medium text-sm sm:text-base font-almarai">{request.name_account}</p>
                        <p className="text-xs sm:text-sm text-gray-500 font-almarai">ID: {request.id_account}</p>
                      <p className="text-xs sm:text-sm text-gray-600 font-almarai">تم الإرسال:  {new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={(e) => handleCancelFriendRequest(e, request.id)}
                      className="mt-2 sm:mt-0 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm flex items-center gap-1 font-almarai"
                      disabled={loading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      إلغاء
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 sm:py-4 text-gray-500 text-xs sm:text-base font-almarai">
                ليس لديك طلبات صداقة معلقة
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white py-4 text-xs xs:text-sm z-10 shadow-lg">
        <div className="container mx-auto px-4 text-center font-almarai">
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

export default NewFriend;