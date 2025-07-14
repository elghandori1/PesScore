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
     <main className="flex flex-col items-center w-full px-2 xs:px-3 sm:px-6 md:px-8 pt-10 xs:pb-14">
      <section className="bg-white/90 backdrop-blur-sm p-3 sm:p-6 rounded-xl shadow-xl w-full max-w-lg sm:max-w-2xl mx-auto">
          {/* Match Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="text-center mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-blue-600 mb-1 sm:mb-2 font-almarai">
                مباراة جديدة
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm font-almarai">
                سجل مباراتك في كرة القدم مع صديقك
              </p>
            </div>

            {/* Selected Friend */}
            <div className="flex flex-col items-center mb-3 sm:mb-4">
              <div className="text-center">
                <b className="text-base sm:text-lg font-bold text-blue-600 font-almarai">
                {friend.name_account || "username"}
                </b>
                <p className="text-xs sm:text-sm text-gray-500 font-almarai">
                 ID: {friend.id_account || "ID"}
                </p>
              </div>
            </div>

            {/* Score Inputs */}
            <div className="flex gap-4 sm:gap-6">
              <div className="w-full sm:w-1/2">
                <label className="block mb-1 sm:mb-2 text-xs text-center sm:text-sm font-medium text-gray-700 font-almarai">
                  نقاطي
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={userScore}
                    onChange={(e) => setUserScore(Number(e.target.value))}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg text-center font-almarai"
                    required
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                    <span className="text-gray-500 text-xs sm:text-sm font-almarai">
                      أهدافي
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-1/2">
                <label className="block mb-1 sm:mb-2 text-xs text-center sm:text-sm font-medium text-gray-700 font-almarai">
                  نقاط الصديق
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={friendScore}
                    onChange={(e) => setFriendScore(Number(e.target.value))}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg text-center font-almarai"
                    required
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                    <span className="text-gray-500 text-xs sm:text-sm font-almarai">
                      أهداف صديقك
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center text-base sm:text-lg font-almarai"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  حفظ المباراة
                </>
              )}
            </button>
          </form>
        </section>
      </main>
    )
}

export default NewScore;