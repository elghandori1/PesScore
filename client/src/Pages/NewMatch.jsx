import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import footballBg from "../assets/images/efootbalBG5.png";

function NewMatch() {
  const { id: friendId } = useParams();
  const navigate = useNavigate();
  const [friend, setFriend] = useState(null);
  const [userScore, setUserScore] = useState("");
  const [friendScore, setFriendScore] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch friend details
  useEffect(() => {
    const fetchFriend = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/friends/list-friends`,
          {
            withCredentials: true,
          }
        );

        const selectedFriend = res.data.friends.find(
          (f) => f.id === parseInt(friendId)
        );
        if (selectedFriend) {
          setFriend(selectedFriend);
        } else {
          navigate("/list-friend"); // Fix: correct path
        }
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          console.error("Failed to load friends", err);
          navigate("/list-friend"); // Fix: correct path
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFriend();
  }, [friendId, navigate]);

  const showAlert = (message, type) => {
    if (type === "error") {
      setError(message);
      setTimeout(() => setError(""), 3000);
    } else {
      setSuccess(message);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userScore || !friendScore) {
      return showAlert("يرجى إدخال النتيجتين معًا", "error");
    }

    setLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/matches/create-match",
        {
          friendId,
          userScore: parseInt(userScore),
          friendScore: parseInt(friendScore),
        },
        { withCredentials: true }
      );

      showAlert("تم حفظ المباراة بنجاح", "success");
      setTimeout(() => {
        navigate(`/Details-friend/${friendId}`);
      }, 1500);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        console.error("Failed to submit match", err);
        showAlert("فشل حفظ المباراة. يُرجى المحاولة مرة أخرى", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !friend) {
    return (
      <div className="flex justify-center py-8">
        <svg
          className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-blue-600"
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
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-100 overflow-hidden">
      {/* Background Image */}
      <div
        className="fixed inset-0 w-full h-full z-0"
        style={{
          backgroundImage: `url(${footballBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      />

      {/* Header */}
      <header className="w-full flex flex-row justify-between items-center px-2 py-2 sm:px-4 sm:py-3 text-white fixed z-30 bg-black/70 backdrop-blur-sm">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
          PesScore
        </h2>
        <Link
          to={`/Details-friend/${friendId}`}
          className="font-almarai bg-white/20 hover:bg-white/40 text-white font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition text-xs sm:text-sm md:text-base flex items-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          العودة إلى السابق
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center min-h-screen pt-20 pb-28 px-1 sm:px-4">
        <section className="bg-white/90 backdrop-blur-sm p-3 sm:p-8 rounded-xl shadow-xl w-full max-w-xs sm:max-w-md mx-auto">
          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-50 text-center text-red-600 p-2 sm:p-3 rounded-md mb-3 sm:mb-4 text-xs sm:text-sm font-almarai">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-center text-green-600 p-2 sm:p-3 rounded-md mb-3 sm:mb-4 text-xs sm:text-sm font-almarai">
              {success}
            </div>
          )}

          {/* Match Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="text-center mb-4 sm:mb-6">
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
                <p className="text-base sm:text-lg font-medium text-blue-600 font-almarai">
                  {friend?.name_account || "غير معروف"}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 font-almarai">
                  ID: {friend?.id_account || ""}
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
                    onChange={(e) => setUserScore(e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg text-center font-almarai"
                    required
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                    <span className="text-gray-500 text-xs sm:text-sm font-almarai">
                      أهداف
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
                    onChange={(e) => setFriendScore(e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg text-center font-almarai"
                    required
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                    <span className="text-gray-500 text-xs sm:text-sm font-almarai">
                      أهداف
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
      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white py-4 text-xs xs:text-sm z-10 shadow-lg">
        <div className="container mx-auto px-4 text-center font-almarai">
          <p className="text-gray-200">
            تم التطوير بواسطة <span dir="ltr">Mohammed elghandori</span>.
            للاقتراحات أو المشاكل،{" "}
            <Link
              to="/Developer"
              className="text-blue-200 underline hover:text-white transition-colors duration-200 font-semibold"
            >
              تواصل معي
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default NewMatch;
