import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMessage } from "../../hooks/useMessage";
import axiosClient from "../../api/axiosClient";
import MatchesTab from './MatchesTab';
import PendingMatch from './PendingMatch'

function FriendDetails() {
  const { id } = useParams();
  const [friend, setFriend] = useState({});
  const [activeTab, setActiveTab] = useState("matches");
  const { showMessage } = useMessage();

  const fetchFriend = async () => {
    try {
      const response = await axiosClient.get(`/friend/friend-details/${id}`);
      setFriend(response.data.friend || {});
    } catch (error) {
      showMessage(
        error.response?.data?.message || "حدث خطأ أثناء جلب بيانات الصديق",
        "error"
      );
    }
  };

  useEffect(() => {
    fetchFriend();
  }, [id]);

  return (
 <main className="flex flex-col items-center w-full px-3 pt-10 pb-14">
  <section className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow w-full max-w-md mx-auto">

    {/* Friend Info Header */}
    <div className="flex justify-between mb-4">
      <div className="flex flex-col justify-center items-start">
        <h2 className="text-lg font-bold text-blue-600 break-words">
         {friend.name_account || "..."}
        </h2>
        <p className="text-xs text-gray-500 break-all">
          ID: {friend.id_account || "..."}
        </p>
      </div>

      {/* Action Button */}
      <Link dir="rtl" to={`/matchscore/${id}`} className="inline-flex items-center justify-center p-2 bg-blue-500 text-white font-medium rounded-full shadow text-xs">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
        </svg>
        <span>مباراة</span>
      </Link>
    </div>

    {/* Tabs Nav */}
    <nav className="flex justify-around border-b border-gray-200 mb-3" dir="rtl">
      <button
        className={`py-2 px-3 text-xs flex items-center gap-1 ${
          activeTab === "pending"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-500"
        }`}
        onClick={() => setActiveTab("pending")}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        المعلقة
      </button>

      <button
        className={`py-2 px-3 text-xs flex items-center gap-1 ${
          activeTab === "matches"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-500"
        }`}
        onClick={() => setActiveTab("matches")}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        المباريات
      </button>
    </nav>

    {/* Tab Content */}
    {activeTab === "matches" ? <MatchesTab id_friend={id}/> : <PendingMatch />}
  </section>
</main>
  );
}

export default FriendDetails;
