import {useState}  from "react";
import PendingFriends from "./PendingFriends";
import ListFriends from "./ListFriends";
function DashboardFriend() {
  const [activeTab, setActiveTab] = useState("friends");
  const handleTabSwitch = (tab) => setActiveTab(tab);

  return (
    <main className="flex flex-col items-center w-full px-2 xs:px-3 sm:px-6 md:px-8 pt-10 xs:pb-14">
      <section className="bg-white/90 backdrop-blur-sm p-3 sm:p-6 rounded-xl shadow-xl w-full max-w-lg sm:max-w-2xl mx-auto">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-blue-600 mb-1 sm:mb-2 font-almarai">
            إدارة الأصدقاء
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm font-almarai">
            تواصل مع أصدقائك في كرة القدم وإدارتهم
          </p>
        </div>

        {/* Tabs nav*/}
        <nav
          className="flex flex-row flex-wrap justify-around border-b border-gray-200 mb-4"
          dir="rtl"
        >
          <button
            className={`py-2 px-4 font-medium text-xs sm:text-base flex items-center gap-2 font-almarai ${
              activeTab === "pending"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => handleTabSwitch("pending")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                clipRule="evenodd"
              />
            </svg>
            المعلقة
          </button>

          <button
            className={`py-2 px-4 font-medium text-xs sm:text-base flex items-center gap-2 font-almarai ${
              activeTab === "friends"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => handleTabSwitch("friends")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
            </svg>
            الأصدقاء
          </button>
        </nav>
        <hr className="border-gray-300 mx-auto" />

        {/* Pending Tab Content */}
        {activeTab === "friends" ? <ListFriends/> : <PendingFriends/> }
      </section>
    </main>
  );
}

export default DashboardFriend;
