import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMessage } from "../../hooks/useMessage";
import axiosClient from "../../api/axiosClient";
import MatchesTab from './MatchesTab';
import PendingTab from './PendingTab'

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
   <main className="flex flex-col items-center w-full px-2 xs:px-3 sm:px-6 md:px-8 pt-10 xs:pb-14">
      <section className="bg-white/90 backdrop-blur-sm p-3 sm:p-6 rounded-xl shadow-xl w-full max-w-lg sm:max-w-2xl mx-auto">

        {/* Friend Info Header */}
        <div className="flex justify-between mb-5">
          <div className="flex flex-col justify-center items-start">
            <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-blue-600 break-words font-almarai">
             {friend.name_account || "username"}
            </h2>
            <p className="text-xs xs:text-sm text-gray-500 break-all font-almarai">
              ID: {friend.id_account || "ID"}
            </p>
          </div>

          {/* Action Button */}
          <Link dir="rtl" to={`/matchscore/${id}`} className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-600 text-xs sm:text-base font-almarai">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            <span>مباراة جديدة</span>
          </Link>
        </div>

        {/* Tabs Nav */}
        <nav className="flex flex-row flex-wrap justify-around border-b border-gray-200 mb-4" dir="rtl">
          <button
            className={`py-2 px-4 font-medium text-xs sm:text-base flex items-center gap-2 font-almarai ${
              activeTab === "pending"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("pending")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            المعلقة
          </button>

          <button
            className={`py-2 px-4 font-medium text-xs sm:text-base flex items-center gap-2 font-almarai ${
              activeTab === "matches"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("matches")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            المباريات
          </button>
        </nav>
        <hr className="border-gray-300 mx-auto" />
        {/* Tab Content */}
        {activeTab === "matches" ? <MatchesTab/> : <PendingTab />}
      </section>
    </main>
  );
}

export default FriendDetails;
