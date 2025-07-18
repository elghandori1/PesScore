import { useState, useEffect } from "react";
import { useMessage } from "../../hooks/useMessage";
import axiosClient from "../../api/axiosClient";
import useAuth from "../../auth/useAuth";

const PendingMatch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { showMessage, clearMessage } = useMessage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("received");
  const [sentMatch, setSentMatch] = useState([]);
  const [receivedMatch, setReceivedMatch] = useState([]);
  const [rejectedMatch, setRejectedMatch] = useState([]);

  const fetchMatch = async () => {
    setIsLoading(true);
    try {
      const [receivedRes, sentRes, rejectRes] = await Promise.all([
        axiosClient.get("/match/received"),
        axiosClient.get("/match/pending"),
        axiosClient.get("/match/rejected"),
      ]);

      setReceivedMatch(receivedRes.data.user || []);
      setSentMatch(sentRes.data.user || []);
      setRejectedMatch(rejectRes.data.user || []);
    } catch (err) {
      showMessage(
        err.response?.data?.message || "حدث خطأ أثناء جلب الطلبات",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();
  }, []);

  const handleAcceptMatch = async (matchId) => {
    setIsLoading(true);
    clearMessage();
    try {
      const response = await axiosClient.post(`/match/accept/${matchId}`);
      showMessage(response.data.message || "تم قبول المباراة", "success");
      fetchMatch();
    } catch (err) {
      showMessage(
        err.response?.data?.message || "حدث خطأ أثناء القبول",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectMatch = async (matchId) => {
    setIsLoading(true);
    clearMessage();
    try {
      const response = await axiosClient.post(`/match/reject/${matchId}`);
      showMessage(response.data.message || "تم رفض المباراة", "success");
      fetchMatch();
    } catch (err) {
      showMessage(
        err.response?.data?.message || "حدث خطأ أثناء الرفض",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelMatch = async (matchId) => {
    setIsLoading(true);
    clearMessage();
    try {
      const response = await axiosClient.delete(`/match/cancel/${matchId}`);
      showMessage(response.data.message || "تم إلغاء المباراة", "success");
      fetchMatch();
    } catch (err) {
      showMessage(
        err.response?.data?.message || "حدث خطأ أثناء الإلغاء",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendMatch = async (matchId) => {
    setIsLoading(true);
    clearMessage();
    try {
      const response = await axiosClient.post(`/match/resend/${matchId}`);
      showMessage(
        response.data.message || "تمت إعادة الإرسال بنجاح",
        "success"
      );
      fetchMatch();
    } catch (err) {
      showMessage(
        err.response?.data?.message || "حدث خطأ أثناء إعادة الإرسال",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelReject = async (matchId) => {
    setIsLoading(true);
    clearMessage();
    try {
      const response = await axiosClient.post(
        `/match/cancel-reject/${matchId}`
      );
      showMessage(response.data.message || "تمت إزالة الرفض بنجاح", "success");
      fetchMatch(); // Refresh data
    } catch (err) {
      showMessage(
        err.response?.data?.message || "حدث خطأ أثناء إزالة الرفض",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderMatchItem = (match, isReceived) => {
    const userScore = isReceived ? match.player2_score : match.player1_score;
    const opponentScore = isReceived
      ? match.player1_score
      : match.player2_score;

    let resultText = "";
    if (userScore > opponentScore) resultText = "فائز";
    else if (userScore < opponentScore) resultText = "خاسر";
    else resultText = "تعادل";

    return (
      <div
        dir="rtl"
        key={match.id}
        className="flex justify-between items-center bg-gray-100 p-3 sm:p-4 rounded-lg border border-gray-200 gap-3"
      >
        {/* Score Section */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex flex-col items-center">
            <span className="text-xs sm:text-sm text-gray-600 font-almarai">
              الخصم
            </span>
            <div className="text-2xl sm:text-3xl font-bold bg-white text-blue-600 rounded-full w-10 h-10 flex items-center justify-center shadow-inner border border-gray-300">
              {opponentScore}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs sm:text-sm text-blue-600 font-almarai">
              VS
            </span>
            <div className="text-xl sm:text-2xl font-bold px-2">-</div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs sm:text-sm text-gray-600 font-almarai">
              أنت
            </span>
            <div className="text-2xl sm:text-3xl font-bold bg-white text-blue-600 rounded-full w-10 h-10 flex items-center justify-center shadow-inner border border-gray-300">
              {userScore}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex flex-col items-center justify-center sm:items-end gap-1 w-full sm:w-auto">
          <div
            className={`px-2 py-1 rounded-full text-xs sm:text-sm font-bold font-almarai ${
              resultText === "فائز"
                ? "bg-green-100 text-green-800"
                : resultText === "خاسر"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {resultText}
          </div>
          <div className="text-xs sm:text-sm text-gray-600 font-almarai">
            {new Date(match.match_date).toLocaleDateString()}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-start">
          {activeTab === "rejected" ? (
            match.created_by === user.id ? (
              <button
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm font-almarai"
                onClick={() => handleResendMatch(match.id)}
              >
                إعادة الإرسال
              </button>
            ) : (
              <button
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm font-almarai"
                onClick={() => handleCancelReject(match.id)}
              >
                إزالة الرفض
              </button>
            )
          ) : isReceived ? (
            <>
              <button
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs sm:text-sm font-almarai"
                onClick={() => handleAcceptMatch(match.id)}
              >
                قبول
              </button>
              <button
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs sm:text-sm font-almarai"
                onClick={() => handleRejectMatch(match.id)}
              >
                رفض
              </button>
            </>
          ) : (
            <button
              className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-xs sm:text-sm font-almarai"
              onClick={() => handleCancelMatch(match.id)}
            >
              إلغاء
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderEmptyMessage = (text) => (
    <div className="py-8 text-center text-gray-500 text-sm sm:text-base">
   <svg
  className="w-12 h-12 mx-auto mb-3 text-gray-400"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    d="M3 21h18M5 21V9m14 12V9M5 9V3h14v6M5 9h14M12 9V3"
  />
</svg>
      <p className="font-almarai">{text}</p>
    </div>
  );

  // Fix: Assign the correct data based on activeTab
  let currentTab = [];
  if (activeTab === "received") currentTab = receivedMatch;
  else if (activeTab === "sent") currentTab = sentMatch;
  else currentTab = rejectedMatch;

  return (
    <div className="w-full mt-3 rounded-lg overflow-hidden border border-gray-300 bg-white shadow-sm">
      {/* Tabs */}
      <div className="flex w-full text-center text-sm sm:text-base font-almarai">
        {["received", "sent", "rejected"].map((tab) => (
          <button
            key={tab}
            className={`w-1/3 py-3 sm:py-3 font-medium flex justify-center items-center gap-2 transition duration-200 ${
              activeTab === tab
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-b"
                : "bg-gray-100 text-gray-600 hover:text-blue-600 border-b"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "received" && <>المباريات الواردة</>}
            {tab === "sent" && <>المباريات المرسلة</>}
            {tab === "rejected" && <>المباريات المرفوضة</>}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-8 text-center">
          <div className="flex justify-center py-8">
            <svg
              className="animate-spin h-6 w-6 text-blue-600"
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
          </div>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            جاري التحميل...
          </p>
        </div>
      ) : (
        <div className="max-h-[330px] sm:max-h-[400px] overflow-y-auto space-y-2 p-2">
          {currentTab.length > 0
            ? currentTab.map((match) =>
                renderMatchItem(match, activeTab === "received")
              )
            : renderEmptyMessage(
                activeTab === "received"
                  ? "لا توجد مباريات واردة"
                  : activeTab === "sent"
                  ? "لا توجد مباريات مرسلة"
                  : "لا توجد مباريات مرفوضة"
              )}
        </div>
      )}
    </div>
  );
};

export default PendingMatch;
