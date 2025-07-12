import {useState,useEffect}  from "react";
import axiosClient from "../../api/axiosClient";
import { useMessage } from "../../hooks/useMessage";

function ListFriends()
{
    const [friends, setFriends] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { showMessage, clearMessage } = useMessage();

  const getFriends = async () => {
        setIsLoading(true);
        clearMessage();
    try {
        const res = await axiosClient.get("/friend/list-friend");
        setFriends(res.data.friends || []);

    } catch (error) {
        showMessage(
            error.response?.data?.message || "حدث خطأ أثناء جلب الأصدقاء",
            "error"
        );
        console.error("Error fetching friends:", error);
    }
    finally {
      setIsLoading(false);
    }
    }
    useEffect(() => {
        getFriends();
    }, []);   


    //remove-frien
    const handleRemoveFriend = async (friendId) => {
     const confirmed = window.confirm("هل أنت متأكد أنك تريد إزالة هذا الصديق؟");
    if (!confirmed) return;
            setIsLoading(true);
          
        try {
           const response  = await axiosClient.delete(`/friend/remove-friend/${friendId}`);
            showMessage(response.data.message || "تم إزالة الصديق بنجاح", "success");
        }catch(error) {
            showMessage(
                error.response?.data?.message || "حدث خطأ أثناء إزالة الصديق",
                "error"
            );
            console.error("Error removing friend:", error);
        }finally{
            setIsLoading(false);
            getFriends();
        }
    }

  return (
    <div>
          {/* Search Input - Only shown in friends tab */}
          <div className="relative mb-3" dir="rtl">
            <input
              value={searchQuery}
    
              type="text"
              placeholder="البحث عن صديقك من قائمة الأصدقاء."
              className="block mt-3 w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-base font-almarai"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

        {/* Content list friends */}
      {isLoading ? (
        <div className="py-8 text-center">
          <div className="flex justify-center py-8">
              <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            جاري التحميل...
          </p>
        </div>
      ) : (
       
    <div className="max-h-[330px] sm:max-h-[400px] overflow-y-auto space-y-2 p-2" dir="rtl">
  {friends.length > 0 ? (
    friends.map((friend) => (
      <div
        key={friend.id}
        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
       
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          <div>
            <p className="text-sm sm:text-base font-almarai text-gray-800">
            <span>{friend.name_account}</span>
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 font-almarai">
              تمت الإضافة: {new Date(friend.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Left Side (Remove Button) */}
        <button
          onClick={() => handleRemoveFriend(friend.id)}
          className="text-red-500 text-xs sm:text-sm hover:underline font-almarai"
        >
          إزالة
        </button>
      </div>
    ))
  ) : (
    <p className="text-center text-gray-500 font-almarai">لا توجد أصدقاء.</p>
  )}
</div>

      )}

    </div>
  );
}

export default ListFriends;