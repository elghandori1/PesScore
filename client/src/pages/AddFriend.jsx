import { useState, useEffect, use } from "react";
import axiosClient from "../api/axiosClient";
import { useMessage } from "../hooks/useMessage";

const AddFriend = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { showMessage, clearMessage } = useMessage();

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPendingRequests = async () => {
      setLoading(true);
      clearMessage();
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
    };
    fetchPendingRequests();
  }, []);

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
      const pendingRes = await axiosClient.get("/friend/pending");// festch updated pending requests
      setPendingRequests(pendingRes.data.user || []);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center w-full px-2 xs:px-3 sm:px-6 md:px-8 pt-10 xs:pb-16">
      <section className="bg-white/90 backdrop-blur-sm p-3 sm:p-6 md:p-8 rounded-xl shadow-xl w-full max-w-md sm:max-w-xl mx-auto">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold text-blue-600 mb-1 font-almarai">
            إضافة صديق
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm font-almarai">
            تواصل مع عشاق كرة القدم الآخرين
          </p>
        </div>

        {/* Search Section */}
        <div className="flex sm:items-center gap-2 mb-2 w-full">
          <input
            dir="rtl"
            type="text"
            placeholder="البحث بالاسم أو معرف اللعبة"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-full px-4 sm:px-5 text-xs sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-almarai"
            disabled={loading}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-center p-2 sm:p-3 rounded-full hover:from-blue-700 hover:to-blue-600 transition-all duration-200 flex-shrink-0 shadow-md"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white text-center"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="mb-3">
            <h3 className="text-base sm:text-lg text-center font-semibold text-blue-600 mb-2 font-almarai">
              نتائج البحث
            </h3>
            {users.length > 0 ? (
              <div className="max-h-[230px] overflow-y-auto space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-row justify-between items-start sm:items-center bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100"
                  >
                    <div>
                      <p className="font-medium text-sm sm:text-base font-almarai">
                        {user.name_account}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 font-almarai">
                        ID: {user.id_account}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleSendFriendRequest(e, user.id)}
                      className="mt-2 sm:mt-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm flex items-center gap-1 font-almarai"
                      disabled={loading}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
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
            <span className="text-blue-600 font-almarai">
              طلبات الصداقة المعلقة ({pendingRequests.length})
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                clipRule="evenodd"
              />
            </svg>
          </h3>

          {pendingRequests.length > 0 ? (
            <div className="max-h-[330px] overflow-y-auto space-y-2">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex justify-between items-center bg-red-100 p-3 sm:p-4 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm sm:text-base font-almarai">
                      {request.name_account}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 font-almarai">
                      ID: {request.id_account}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 font-almarai">
                      تم الإرسال:{" "}
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleCancelFriendRequest(e, request.id)}
                    className="mt-2 sm:mt-0 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm flex items-center gap-1 font-almarai"
                    disabled={loading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
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
  );
};

export default AddFriend;
