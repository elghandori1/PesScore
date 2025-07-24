import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { useMessage } from "../../hooks/useMessage";
import useAuth from "../../auth/useAuth";

function ListFriends({activeTab}) {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const { showMessage } = useMessage();
  const { user } = useAuth();

  const getFriends = async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get("/friend/list-friend");
      setFriends(res.data.friends || []);
    } catch (error) {
      showMessage(
        error.response?.data?.message || "حدث خطأ أثناء جلب الأصدقاء",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getFriends();
  }, [activeTab]);

  const handleRemoveFriend = async (friendId) => {
    try {
      const res = await axiosClient.put(`/friend/remove-request/${friendId}`);
      showMessage(res.data.message || "تم طلب إزالة الصديق بنجاح", "success");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "حدث خطأ أثناء إزالة الصديق",
        "error"
      );
    } finally {
      getFriends();
    }
  };

  const handleCancelRemoval = async (friendId) => {
    try {
      const res = await axiosClient.put(
        `/friend/cancel-remove-request/${friendId}`
      );
      showMessage(res.data.message || "تم إلغاء طلب الإزالة", "success");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "حدث خطأ أثناء إلغاء الطلب",
        "error"
      );
    } finally {
      getFriends();
    }
  };

  const handleAcceptRemoval = async (friendId) => {
    try {
      const res = await axiosClient.put(
        `/friend/accept-remove-request/${friendId}`
      );
      showMessage(res.data.message || "تم قبول إزالة الصديق", "success");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "حدث خطأ أثناء قبول الطلب",
        "error"
      );
    } finally {
      getFriends();
    }
  };

  const handleRejectRemoval = async (friendId) => {
    try {
      const res = await axiosClient.put(
        `/friend/reject-remove-request/${friendId}`
      );
      showMessage(res.data.message || "تم رفض طلب الإزالة", "success");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "حدث خطأ أثناء رفض الطلب",
        "error"
      );
    } finally {
      getFriends();
    }
  };

  const filteredFriends = friends.filter((friend) =>
    friend.name_account.toLowerCase().includes(search.toLowerCase())
  );

  return (
<div>
  <div className="flex items-center justify-between mt-3" dir="rtl">
    <div className="text-sm text-blue-600">
      الأصدقاء: <b>{friends.length}</b>
    </div>
  </div>

  {/* Search Input */}
  <div className="relative mb-2" dir="rtl">
    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="البحث عن صديق..."
      className="block mt-2 w-full pr-8 pl-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
    />
    <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
      <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
      </svg>
    </div>
  </div>

  {/* List Content */}
  {isLoading ? (
    <div className="py-6 text-center">
      <div className="flex justify-center py-4">
        <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
      <p className="text-gray-600 text-sm">جاري التحميل...</p>
    </div>
  ) : (
    <div className="max-h-[360px] overflow-y-auto space-y-2 p-1" dir="rtl">
      {filteredFriends.length > 0 ? (
        filteredFriends.map((friend) => (
          <div
            key={friend.id}
            className={`flex items-center justify-between p-2 border rounded-lg ${
              friend.status === "pending_removal"
                ? "bg-red-50 border-red-200"
                : "bg-white border-gray-200"
            }`}
          >
            {friend.status === "active" ? (
              <Link to={`/friend-details/${friend.id}`} className="flex items-center gap-2">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-800">{friend.name_account}</p>
                  <p className="text-[9px] text-gray-500">
                    {new Date(friend.created_at).toLocaleDateString()}
                  </p>
                  {friend.status === "pending_removal" && (
                    <p className="text-[9px] mt-1 text-red-600">
                      {friend.requested_by === user.id
                        ? "لقد طلبت إزالة هذا الصديق"
                        : "يريد هذا الصديق إزالتك"}
                    </p>
                  )}
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-2 opacity-70">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-800">{friend.name_account}</p>
                  <p className="text-[9px] text-gray-500">
                    {new Date(friend.created_at).toLocaleDateString()}
                  </p>
                  {friend.status === "pending_removal" && (
                    <p className="text-[9px] mt-1 text-red-600">
                      {friend.requested_by === user.id
                        ? "لقد طلبت إزالة هذا الصديق"
                        : "يريد هذا الصديق إزالتك"}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {friend.status === "pending_removal" ? (
              friend.requested_by === user.id ? (
                <button
                  onClick={() => handleCancelRemoval(friend.id)}
                  className="px-2 py-1 text-xs rounded-full text-white bg-red-500"
                >
                  إلغاء
                </button>
              ) : (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleAcceptRemoval(friend.id)}
                    className="px-2 py-1 text-xs rounded-full text-white bg-red-500"
                  >
                    قبول
                  </button>
                  <button
                    onClick={() => handleRejectRemoval(friend.id)}
                    className="px-2 py-1 text-xs rounded-full text-white bg-gray-500"
                  >
                    رفض
                  </button>
                </div>
              )
            ) : (
              <button
                onClick={() => handleRemoveFriend(friend.id)}
                className="text-red-500 text-xs"
              >
                إزالة
              </button>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-1 text-sm text-gray-900">لا توجد أصدقاء</p>
        </div>
      )}
    </div>
  )}
</div>

  );
}

export default ListFriends;
