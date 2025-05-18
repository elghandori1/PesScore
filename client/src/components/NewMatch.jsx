import { useEffect, useState } from "react";
import { useNavigate,useParams,Link } from "react-router-dom";
import axios from "axios";
import footballBg from "../assets/images/efootbalBG3.png";
function NewMatch() {
    const { friendId } = useParams();
    const navigate = useNavigate();
  
    const [friend, setFriend] = useState(null);
    const [userScore, setUserScore] = useState("");
    const [friendScore, setFriendScore] = useState("");
    const [alert, setAlert] = useState({ message: "", type: "" });
  
    // Fetch friend details
    useEffect(() => {
      const fetchFriend = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/friends`, {
            withCredentials: true,
          });
  
          const selectedFriend = res.data.friends.find((f) => f.id === parseInt(friendId));
          if (selectedFriend) {
            setFriend(selectedFriend);
          } else {
            navigate("/listfreind");
          }
        } catch (err) {
          console.error("Failed to load friends", err);
          navigate("/login");
        }
      };
  
      fetchFriend();
    }, [friendId]);
  
    const showAlert = (message, type = "success") => {
      setAlert({ message, type });
      setTimeout(() => {
        setAlert({ message: "", type: "" });
      }, 4000);
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      if (!userScore || !friendScore) {
        return showAlert("Please enter both scores.", "error");
      }
  
      try {
        await axios.post(
          "http://localhost:5000/matches",
          {
            opponent_id: friendId,
            user_score: parseInt(userScore),
            opponent_score: parseInt(friendScore),
          },
          { withCredentials: true }
        );
  
        showAlert("Match saved successfully!", "success");
        setTimeout(() => {
          navigate(`/Details-friend/${friendId}`);
        }, 1500);
      } catch (err) {
        console.error("Failed to submit match", err);
        showAlert("Failed to save match. Try again.", "error");
      }
    };
  
    if (!friend) {
      return <div>Loading...</div>;
    }
  
    return (
      <div className="min-h-screen flex flex-col items-center overflow-x-hidden relative">
        {/* Background */}
        <div
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: `url(${footballBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          }}
        />
  
        {/* Alert Notification */}
        {alert.message && (
          <div
            className={`fixed top-5 left-1/2 transform -translate-x-1/2 max-w-[400px] min-w-[250px] px-6 py-4 rounded font-bold text-center z-[1000] transition-opacity duration-300 border-l-4 shadow-lg ${
              alert.type === "success"
                ? "bg-[#e8f5e9] text-[#2e7d32] border-[#2e7d32]"
                : "bg-red-100 text-red-800 border-red-600"
            }`}
          >
            {alert.message}
          </div>
        )}
    {/* Header */}
    <header className="w-full flex justify-between items-center px-4 sm:px-5 py-3 sm:py-4 text-white fixed top-0 left-0 z-10 bg-black/60">
        <h2 className="text-xl sm:text-2xl font-bold">PesScore</h2>
        <Link
          to={`/Details-friend/${friendId}`}
          className="bg-white/20 hover:bg-white/40 text-white font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition text-sm sm:text-base"
        >
          Prev Page
        </Link>
      </header>
      <main className="flex flex-col items-center w-full pt-24 md:pt-20 px-4 pb-8">
  <section className="bg-white backdrop-blur-lg p-4 rounded-xl shadow-lg w-full max-w-md md:max-w-2xl">
    {/* Match Form */}
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800">New Match</h2>

      <div>
        <label className="block mb-2 text-sm md:text-base font-medium text-gray-700">
          Selected Friend
        </label>
        <input
          className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed text-gray-800"
          value={friend.account_name || ""}
          readOnly
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/2">
          <label className="block mb-2 text-sm md:text-base font-medium text-gray-700">
            My Score
          </label>
          <input
            type="number"
            min="0"
            max="20"
            value={userScore}
            onChange={(e) => setUserScore(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
            required
          />
        </div>
        <div className="w-full sm:w-1/2">
          <label className="block mb-2 text-sm md:text-base font-medium text-gray-700">
            Friend's Score
          </label>
          <input
            type="number"
            min="0"
            max="20"
            value={friendScore}
            onChange={(e) => setFriendScore(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-[1.01] active:scale-[0.99]"
      >
        Save Match
      </button>
    </form>
  </section>
</main>
               {/* Footer */}
               <footer className="bg-gradient-to-r from-blue-800 to-blue-700 text-white w-full text-center py-4 mt-auto text-sm backdrop-blur-sm">
                PesScore © 2025 - Football Match Tracker
            </footer>
      </div>
    );
  }
  
  export default NewMatch;
