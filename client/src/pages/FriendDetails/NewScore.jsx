import { useState,useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import useAuth from "../../auth/useAuth"
import { useMessage } from "../../hooks/useMessage";
import axiosClient from "../../api/axiosClient";

function NewScore(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [friend, setFriend] = useState({});
  const [userScore, setUserScore] = useState('');
  const [friendScore, setFriendScore] = useState('');
  const [loading, setLoading] = useState(false);
  const { showMessage } = useMessage();
  const { user } = useAuth();

    const fetchFriend = async () => {
    try {
      const response = await axiosClient.get(`/friend/friend-details/${id}`);
      setFriend(response.data.friend  || {});
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


  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
      await axiosClient.post("/match/create", {
      player1_id: user.id,
      player2_id: id,
      player1_score: userScore,
      player2_score: friendScore
    });
    setUserScore('');
    setFriendScore('');
    showMessage("تم حفظ المباراة بنجاح",'success');
    setTimeout(()=>{
        navigate(`/friend-details/${id}`)
    }, 2000)
  } catch (error) {
    console.error(error);
    showMessage("حدث خطأ أثناء حفظ المباراة",'error');
  } finally {
    setLoading(false);
  }
};

    return(
    <main className="flex flex-col items-center w-full px-3 pt-10 pb-14">
  <section className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow w-full max-w-md mx-auto">
    {/* Match Form */}
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold text-blue-600 mb-1">
          مباراة جديدة
        </h2>
        <p className="text-gray-600 text-xs">
          سجل مباراتك مع صديقك
        </p>
      </div>

      {/* Selected Friend */}
      <div className="flex flex-col items-center mb-3">
        <div className="text-center">
          <b className="text-base font-bold text-blue-600">
          {friend.name_account || "username"}
          </b>
          <p className="text-xs text-gray-500">
           ID: {friend.id_account || "ID"}
          </p>
        </div>
      </div>

      {/* Score Inputs */}
      <div className="flex gap-3">
        <div className="w-1/2">
          <label className="block mb-2 text-xs text-center font-bold text-gray-700">
            نقاطي
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="20"
              value={userScore}
              onChange={(e) => setUserScore(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base text-center"
              required
              disabled={loading}
            />
         
          </div>
        </div>

        <div className="w-1/2">
          <label className="block mb-2 text-xs text-center font-bold text-gray-700">
            نقاط الصديق
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="20"
              value={friendScore}
              onChange={(e) => setFriendScore(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base text-center"
              required
              disabled={loading}
            />
           
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center text-base"
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            جاري الحفظ...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            حفظ
          </>
        )}
      </button>
    </form>
  </section>
</main>
    )
}

export default NewScore;