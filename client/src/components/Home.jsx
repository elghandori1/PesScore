import React from "react";
import { Link } from "react-router-dom";
import footballBg from "../assets/images/efootbalBG3.png";

function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center overflow-x-hidden relative"
    >
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${footballBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed"
        }}
      />
      {/* Header */}
      <header className="w-full flex justify-between items-center px-5 py-4 text-white fixed top-0 left-0 z-10 bg-black/60">
        <h2 className="text-2xl font-bold" >PesScore</h2>
        <div>
          <Link
            to="/login"
            className="bg-white/20 hover:bg-white/40 text-white font-semibold px-4 py-2 rounded-full transition"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center w-full px-5 pt-28 pb-10">
        <section className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-xl w-full backdrop-blur-sm">
          <h2 className="text-2xl mb-4 text-blue-700 font-semibold">Description</h2>
          <p className="text-gray-800 text-lg leading-relaxed">
            PesScore is a mobile-friendly web app designed to track and display
            the results and history of football matches between friends.
          </p>
        </section>

        <div className="flex justify-around flex-wrap max-w-xl w-full mt-8 gap-5">
          <Link
            to="/add"
            className="bg-gradient-to-r from-blue-700 to-blue-500 hover:bg-blue-900/90 transform hover:scale-105 transition text-white p-5 rounded-2xl w-[45%] text-center flex flex-col items-center no-underline shadow-md hover:shadow-lg backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-lg">Add Friend</span>
          </Link>

          <Link
            to="/list"
            className="bg-gradient-to-r from-blue-700 to-blue-500 hover:bg-blue-900/90 transform hover:scale-105 transition text-white p-5 rounded-2xl w-[45%] text-center flex flex-col items-center no-underline shadow-md hover:shadow-lg backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-lg">List Friends</span>
            </Link>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-800 to-blue-700 text-white w-full text-center py-4 mt-auto text-sm backdrop-blur-sm">
        PesScore © 2025 - Football Match Tracker
      </footer>
    </div>
  );
}

export default Home;