import { useState, useEffect, useCallback } from "react";
import axiosClient from "../api/axiosClient";
import { useMessage } from "../hooks/useMessage";
import { useSocketContext } from "../context/SocketContext";
import useAuth from "../auth/useAuth";

const AddFriend = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { user } = useAuth();
  const { showMessage, clearMessage } = useMessage();
  const socketRef = useSocketContext();
  if (!user) return null;

  const handleSearch = async () => {
    if (!search.trim()) {
      showMessage("الرجاء إدخال اسم أو معرف اللعبة للبحث", "error");
      return;
    }
    setLoading(true);
    clearMessage();

    try {
      const res = await axiosClient.get(
        `/friend/search?query=${encodeURIComponent(search.trim())}`
      );
      setUsers(res.data.users || []);
      setHasSearched(true);
    } catch (err) {
      showMessage(
        err.response?.data?.message || "حدث خطأ أثناء البحث",
        "error"
      );
       setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/friend/pending");
      setPendingRequests(res.data.user || []);
    } catch (err) {
      showMessage(
        err.response?.data?.message || "حدث خطأ أثناء جلب طلبات الصداقة",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  useEffect(() => {
    const s = socketRef?.current;
    if (!s) return;
    s.on("friend:accepted", fetchPendingRequests);
    s.on("friend:rejected", fetchPendingRequests);
    s.on("friend:requestCancelled", fetchPendingRequests);
    return () => {
      s.off("friend:accepted", fetchPendingRequests);
      s.off("friend:rejected", fetchPendingRequests);
      s.off("friend:requestCancelled", fetchPendingRequests);
    };
  }, [socketRef, fetchPendingRequests]);

  const handleSendFriendRequest = async (event, receiverId) => {
    event.preventDefault();
    clearMessage();
    setLoading(true);
    try {
      const res = await axiosClient.post("/friend/request", { receiverId });
      showMessage(res.data.message, "success");
      setHasSearched(false);
      setUsers(users.filter((user) => user.id !== receiverId));
      setSearch("");
      await fetchPendingRequests();
    } catch (err) {
      showMessage(
        err.response?.data?.message || "حدث خطأ أثناء إرسال طلب الصداقة",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelFriendRequest = async (event, requestId) => {
    event.preventDefault();
    clearMessage();
    setLoading(true);
    try {
       await axiosClient.delete(`/friend/request/${requestId}`);
      setPendingRequests(pendingRequests.filter(req => req.id !== requestId));

      showMessage("تم إلغاء طلب الصداقة بنجاح", "success");
    } catch (err) {
      showMessage(
        err.response?.data?.message || "حدث خطأ أثناء إلغاء طلب الصداقة",
        "error"
      );
      console.error("Error canceling friend request:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
 <main className="flex flex-col items-center w-full px-3 pt-10 pb-16">
  <section className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow w-full max-w-md mx-auto">
    <div className="text-center mb-5">
      <h2 className="text-lg font-bold text-blue-600 mb-1">
        إضافة صديق
      </h2>
      <p className="text-gray-600 text-xs">
        تواصل مع عشاق الكرة
      </p>
    </div>

    {/* Search Section */}
    <div className="flex items-center gap-2 mb-3 w-full">
      <input
        dir="rtl"
        type="text"
        placeholder="البحث بالاسم أو المعرف"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-full px-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={loading}
      />
      <button
        onClick={handleSearch}
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded-full flex-shrink-0"
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    </div>

    {/* Search Results */}
    {hasSearched && (
      <div className="mb-3">
        <h3 className="text-base text-center font-semibold text-blue-600 mb-2">
          نتائج البحث
        </h3>
        {users.length > 0 ? (
          <div className="max-h-[90px] overflow-y-auto space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex justify-between items-start bg-white p-3 rounded-lg border border-gray-100"
              >
                <div>
                  <p className="font-medium text-sm">
                    {user.name_account}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {user.id_account}
                  </p>
                </div>
                <button
                  onClick={(e) => handleSendFriendRequest(e, user.id)}
                  className="mt-1 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium"
                  disabled={loading}
                >
                  إضافة
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 text-xs">
            لم يتم العثور على مستخدمين
          </div>
        )}
      </div>
    )}

    {/* Pending Requests Section */}
    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-2">
      <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center justify-end gap-1">
        <span className="text-blue-600">
          المعلقة ({pendingRequests.length})
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
        </svg>
      </h3>

      {pendingRequests.length > 0 ? (
        <div className="max-h-[320px] overflow-y-auto space-y-2">
          {pendingRequests.map((request) => (
            <div
              key={request.id}
              className="flex justify-between items-start bg-red-100 p-3 rounded-lg"
            >
              <div>
                <p className="font-medium text-sm">
                  {request.name_account}
                </p>
                <p className="text-xs text-gray-500">
                  ID: {request.id_account}
                </p>
                <p className="text-[10px] text-gray-600">
                  {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => handleCancelFriendRequest(e, request.id)}
                className="mt-1 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium"
                disabled={loading}
              >
                إلغاء
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-3 text-gray-500 text-xs">
          لا توجد طلبات معلقة
        </div>
      )}
    </div>
  </section>
</main>
  );
};

export default AddFriend;
