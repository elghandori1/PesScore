import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import footballBg from "../assets/images/efootbalBG3.png";

import axios from "axios";
function Detailsfriend() {
  const { id } = useParams();
  const [friend, setFriend] = useState(null);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchFriendDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/friends/${id}`, {
          withCredentials: true,
        });
        setFriend(res.data.friend);
      } catch (err) {
        console.error("Failed to fetch friend details", err);
      }
    };

    const fetchMatches = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/friends/${id}/matches`, {
          withCredentials: true,
        });

        setMatches(res.data.matches);
      } catch (err) {
        console.error("Failed to fetch matches", err);
      }
    };

    fetchFriendDetails();
    fetchMatches();
  }, [id]);

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

      {/* Header */}
      <header className="w-full flex justify-between items-center px-4 sm:px-5 py-3 sm:py-4 text-white fixed top-0 left-0 z-10 bg-black/60">
        <h2 className="text-xl sm:text-2xl font-bold">PesScore</h2>
        <Link
          to="/listfreind"
          className="bg-white/20 hover:bg-white/40 text-white font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition text-sm sm:text-base"
        >
          Prev Page
        </Link>
      </header>

      {/* Main */}
      <main className="flex flex-col items-center mt-8 w-full pt-8 md:pt-12 px-4 pb-8">
        <section className="bg-white backdrop-blur-md p-4 md:p-6 rounded-xl shadow-lg w-full max-w-md md:max-w-2xl">
          {friend ? (
            <>
              <div className="mb-1 md:mb-4">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 text-center md:text-left">
                  Matches with: <span className="text-blue-600">{friend.account_name}</span>
                </h3>

                <div className="flex flex-col sm:flex-row justify-between items-center mt-3 gap-3">
                  <span className="text-sm md:text-base font-medium text-gray-600">
                    Total Matches: <span className="font-semibold">{matches.length}</span>
                  </span>
                  <Link
                    to={`/newmatch/${id}`}
                    className="w-full sm:w-auto border px-4 py-2 rounded-full text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-sm md:text-base font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    New Match +
                  </Link>
                </div>
              </div>


              <div className="mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-1 md:mb-2">
                  Historique
                </h3>
                <hr className="border-gray-200" />
              </div>
              <ul className="space-y-3 md:space-y-4">
                {matches.length === 0 ? (
                  <li className="text-gray-500 text-center py-4">No matches yet. Start by adding one!</li>
                ) : (
                  matches.map((match) => {
                    const isCurrentUserUser1 = parseInt(match.user1_id) === parseInt(id);
                    const dateString = new Date(match.date_time).toLocaleDateString();
                    const userScore = isCurrentUserUser1 ? match.user1_score : match.user2_score;
                    const opponentScore = isCurrentUserUser1 ? match.user2_score : match.user1_score;

                    return (
                      <li
                        key={match.match_id}
                        className="border p-3 md:p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex justify-between items-center w-full">
                          {/* Left side (Opponent) */}
                          <div className="flex flex-col items-center w-1/2">
                            <span className="font-medium text-gray-800 text-sm md:text-base mb-1">
                              {isCurrentUserUser1 ? friend.account_name : "Me"}
                            </span>
                            <span className="text-red-500 text-lg md:text-xl font-bold">
                              {opponentScore}
                            </span>
                          </div>

                          {/* Divider */}
                          <div className="text-gray-400 mx-2">-</div>

                          {/* Right side (You) */}
                          <div className="flex flex-col items-center w-1/2">
                            <span className="font-medium text-gray-800 text-sm md:text-base mb-1">
                              {isCurrentUserUser1 ? "Me" : friend.account_name}
                            </span>
                            <span className="text-red-500 text-lg md:text-xl font-bold">
                              {userScore}
                            </span>
                          </div>
                        </div>

                        {/* Date */}
                        <div className="mt-2 text-center text-xs md:text-sm text-gray-500">
                          {dateString}
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            </>
          ) : (
            <div className="flex justify-center items-center py-8">
              <p className="text-gray-600 animate-pulse">Loading friend details...</p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-800 to-blue-700 text-white w-full text-center py-4 mt-auto text-sm backdrop-blur-sm">
        PesScore © 2025 - Football Match Tracker
      </footer>
    </div>
  );
}

export default Detailsfriend;