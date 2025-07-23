import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { useMessage } from "../../hooks/useMessage";
import useAuth from "../../auth/useAuth";

const calculateStats = (matches, userId) => {
  return matches.reduce((stats, match) => {
    const userIsPlayer1 = match.player1_id === userId;
    const player1Wins = match.player1_score > match.player2_score;
    const player2Wins = match.player2_score > match.player1_score;
    const isDraw = match.player1_score === match.player2_score;

    if (isDraw) {
      stats.draws++;
    } else if (userIsPlayer1) {
      if (player1Wins) stats.wins++;
      else stats.losses++;
    } else {
      if (player2Wins) stats.wins++;
      else stats.losses++;
    }
    return stats;
  }, { wins: 0, draws: 0, losses: 0 });
};

const MatchesTab = ({ id_friend }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showMessage } = useMessage();
  const { user } = useAuth();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/match/score/${id_friend}`);
      setMatches(res.data.matches || []);
    } catch (error) {
      console.error("Error fetching matches:", error);
      showMessage("فشل في جلب المباريات", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemovelMatch = async (matchId) => {
    try {
      const res = await axiosClient.post(`/match/removematch/${matchId}`);
      showMessage(res.data.message || "تم إلغاء المباراة", "success");
      await fetchMatches();
    } catch (error) {
      console.error("Error canceling match:", error);
      showMessage("فشل في إلغاء المباراة", "error");
    }
  };

  const handleAcceptRemove = async (matchId) => {
    try {
      const res = await axiosClient.post(`/match/acceptremove/${matchId}`);
      if (res.data) {
        showMessage(res.data.message || "تم قبول إزالة المباراة", "success");
        await fetchMatches();
      }
    } catch (error) {
      console.error("Error accepting remove:", error);
      showMessage("فشل في قبول إزالة المباراة", "error");
    }
  };

  const handleRejectRemove = async (matchId) => {
    try {
      const res = await axiosClient.post(`/match/rejectremove/${matchId}`);
      if (res.data) {
        showMessage(res.data.message || "تم رفض إزالة المباراة", "success");
        await fetchMatches();
      }
    } catch (error) {
      console.error("Error rejecting remove:", error);
      showMessage("فشل في رفض إزالة المباراة", "error");
    }
  };

  const handleCancelRemove = async (matchId) => {
    try {
      const res = await axiosClient.post(`/match/cancelremove/${matchId}`);
      showMessage(res.data.message || "تم إلغاء المباراة", "success");
      await fetchMatches();
    } catch (error) {
      console.error("Error canceling match:", error);
      showMessage("فشل في إلغاء المباراة", "error");
    }
  };

  const truncateName = (name, length = 6) => {
    if (!name) return "";
    return name.length > length ? name.slice(0, length) + ".." : name;
  };

   const stats = calculateStats(matches, user.id);

  return (
    <div>
         <div className="bg-white rounded-lg shadow-sm p-4 my-3" dir="rtl">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="flex flex-col">
            <span className="text-sm sm:text-base text-gray-600">المباريات</span>
            <span className="text-lg sm:text-xl font-bold text-blue-600">
              {matches.length}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base text-gray-600">الفوز</span>
            <span className="text-lg sm:text-xl font-bold text-green-600">
              {stats.wins}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base text-gray-600">التعادل</span>
            <span className="text-lg sm:text-xl font-bold text-yellow-600">
              {stats.draws}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base text-gray-600">الخسارة</span>
            <span className="text-lg sm:text-xl font-bold text-red-600">
              {stats.losses}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center">
          <div className="flex justify-center py-8">
            <svg
              className="animate-spin h-6 w-6 text-blue-600"
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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            جاري التحميل...
          </p>
        </div>
      ) : matches.length > 0 ? (
        <div
          className="max-h-[330px] sm:max-h-[400px] overflow-y-auto space-y-3 p-1"
          dir="rtl"
        >
          {matches.map((match) => (
            <div
              key={match.id}
              className={`flex justify-between items-center p-3 rounded-lg border border-blue-500
        ${
          match.removed === "pending_remove"
            ? "bg-red-50 border-red-200"
            : "bg-gray-100 border-gray-200"
        }`}
            >
              {/* Score Section */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex flex-col items-center">
                  <span className="text-xs sm:text-sm text-gray-600" dir="ltr">
                    {match.player1_id === user.id
                      ? "أنت"
                      : truncateName(match.player1_name)}
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold bg-white text-blue-600 rounded-full w-10 h-10 flex items-center justify-center shadow-inner border border-gray-300">
                    {match.player1_score}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <span className="text-xs sm:text-sm text-blue-600 font-almarai">
                    VS
                  </span>
                  <div
                    className={`px-2 py-1 rounded-full text-xs sm:text-sm font-bold font-almarai ${
                      match.player1_score > match.player2_score
                        ? match.player1_id === user.id
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                        : match.player2_score > match.player1_score
                        ? match.player2_id === user.id
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {match.player1_score > match.player2_score
                      ? match.player1_id === user.id
                        ? "فائز"
                        : "خاسر"
                      : match.player2_score > match.player1_score
                      ? match.player2_id === user.id
                        ? "فائز"
                        : "خاسر"
                      : "تعادل"}
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-xs sm:text-sm text-gray-600 font-almarai">
                    {match.player2_id === user.id ? "أنت" : match.player2_name}
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold bg-white text-blue-600 rounded-full w-10 h-10 flex items-center justify-center shadow-inner border border-gray-300">
                    {match.player2_score}
                  </div>
                </div>
              </div>
              {/* Date and Status */}
              <div className="flex flex-col items-end gap-1">
                <p className="text-xs sm:text-sm text-gray-500">
                  {new Date(match.match_date).toLocaleDateString()}
                </p>

                <div className="flex flex-col gap-2">
                  {match.removed === "no" ? (
                    <button
                      onClick={() => handleRemovelMatch(match.id)}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs sm:text-sm font-almarai"
                    >
                      إزالة
                    </button>
                  ) : match.removed === "pending_remove" &&
                    match.removal_requested_by === user.id ? (
                    <div className="flex flex-col items-end gap-1">
                      <button
                        onClick={() => handleCancelRemove(match.id)}
                        className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-xs sm:text-sm font-almarai"
                      >
                        إلغاء الطلب
                      </button>
                      <small className="text-[10px] sm:text-xs mt-1 text-red-600">
                         طلبت حذف هذه النتيجة
                      </small>
                    </div>
                  ) : match.removed === "pending_remove" &&
                    match.removal_requested_by !== user.id ? (
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRemove(match.id)}
                          className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs sm:text-sm"
                        >
                          قبول
                        </button>
                        <button
                          onClick={() => handleRejectRemove(match.id)}
                          className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs sm:text-sm "
                        >
                          رفض
                        </button>
                      </div>
                    <small className="text-[10px] sm:text-xs mt-1 text-red-600">
                        صديقك يريد حذف النتيجة
                      </small>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 xs:py-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 xs:h-12 xs:w-12 mx-auto text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-base xs:text-lg font-medium text-gray-900 font-almarai">
            لا توجد مباريات
          </h3>
        </div>
      )}
    </div>
  );
};

export default MatchesTab;
