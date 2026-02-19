import { Link } from "react-router-dom";
import {useState, useEffect} from "react"
import useAuth from "../auth/useAuth";
import axiosClient from "../api/axiosClient";
import { useMessage } from "../hooks/useMessage";
import { useSocketContext } from "../context/SocketContext";

const Home = () => {
  const { user } = useAuth();
  const { clearMessage } = useMessage();
  const socketRef = useSocketContext();
  const [hasNotifications, setHasNotifications] = useState(false);

  const checkNotifications = async () => {
    try {
      // Get pending friend requests
      const friendRes = await axiosClient.get("/friend/received");
      const pendingFriends = friendRes.data.user;

      // Get pending matches
      const matchesRes = await axiosClient.get("/match/received");
      const pendingMatches = matchesRes.data.user;

      // Set notification if there are any pending requests
      setHasNotifications(
        (pendingFriends && pendingFriends.length > 0) || 
        (pendingMatches && pendingMatches.length > 0)
      );
    } catch (error) {
      console.error("Error checking notifications:", error);
    }
  };

   useEffect(() => {
    // Check for notifications when component mounts
    if (user) {
      checkNotifications();
    }
  }, [user]);

  // Listen for real-time socket events
  useEffect(() => {
    if (!socketRef?.current || !user) return;

    const socket = socketRef.current;

    // Friend request events
    socket.on("friend:request", () => {
      checkNotifications();
    });

    socket.on("friend:requestCancelled", () => {
      checkNotifications();
    });

    // Match events
    socket.on("match:new", () => {
      checkNotifications();
    });

    socket.on("match:cancelled", () => {
      checkNotifications();
    });

    socket.on("match:rejected", () => {
      checkNotifications();
    });

    socket.on("match:accepted", () => {
      checkNotifications();
    });

    // Cleanup listeners
    return () => {
      socket.off("friend:request");
      socket.off("friend:requestCancelled");
      socket.off("match:new");
      socket.off("match:cancelled");
      socket.off("match:rejected");
      socket.off("match:accepted");
    };
  }, [socketRef, user]);

  clearMessage();
  if (!user) return null;

  return (
   <main className="flex flex-col items-center w-full px-3 pt-16 pb-12">
  <section className="bg-white/90 mt-4 p-4 rounded-lg shadow text-center w-full max-w-sm mx-auto backdrop-blur-sm">
    <h2 className="text-xl mb-2 text-blue-600 font-semibold">
      PesScore
    </h2>
    <p
      className="text-gray-800 text-sm xs:text-base sm:text-lg leading-relaxed"
      dir="ltr"
    >
          مرحباً بك في موقع <b className="text-blue-600">بيس سكور</b> حيث يمكنك
          حفظ سجلات المباريات بينك وبين أصدقائك بسهولة. ابدأ الآن واستمتع بتجربة
          اللعب مع أصدقائك وحفظ نتائج مبارياتك
        </p>
  </section>

  <div className="flex gap-3 max-w-sm w-full mt-6">
    <Link
      to="/add-friend"
      className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center flex-1 transition"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 mx-auto mb-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      <span className="text-sm">إضافة صديق</span>
    </Link>

    <Link
      to="/Dashboard-Friend"
      className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center flex-1 transition  relative"
    >
           {hasNotifications && (
       <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 mx-auto mb-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <span className="text-sm">الأصدقاء</span>
    </Link>
  </div>
</main>
  );
};

export default Home;
