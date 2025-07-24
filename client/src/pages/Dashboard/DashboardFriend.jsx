import {useState}  from "react";
import PendingFriends from "./PendingFriends";
import ListFriends from "./ListFriends";
function DashboardFriend() {
  const [activeTab, setActiveTab] = useState("friends");
  const handleTabSwitch = (tab) => setActiveTab(tab);

  return (
<main className="flex flex-col items-center w-full px-3 pt-10 pb-14">
  <section className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow w-full max-w-md mx-auto">
    <div className="text-center mb-2">
      <h2 className="text-lg font-bold text-blue-600">
        إدارة الأصدقاء
      </h2>
    </div>

    {/* Tabs nav*/}
    <nav className="flex justify-around border-b border-gray-200 mb-4" dir="rtl">
      <button
        className={`py-2 px-3 text-xs flex items-center gap-1 ${
          activeTab === "pending"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-500"
        }`}
        onClick={() => handleTabSwitch("pending")}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
        </svg>
        المعلقة
      </button>

      <button
        className={`py-2 px-3 text-xs flex items-center gap-1 ${
          activeTab === "friends"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-500"
        }`}
        onClick={() => handleTabSwitch("friends")}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
        </svg>
        الأصدقاء
      </button>
    </nav>

    {/* Tab Content */}
    {activeTab === "friends" ? <ListFriends activeTab={activeTab}/> : <PendingFriends/> }
  </section>
</main>
  );
}

export default DashboardFriend;
