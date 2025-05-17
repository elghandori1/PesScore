import { Link } from "react-router-dom";
import footballBg from "../assets/images/efootbalBG3.png";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center overflow-x-hidden relative">
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

      <header className="w-full flex justify-between items-center px-3 sm:px-4 md:px-5 py-3 sm:py-4 text-white fixed top-0 left-0 z-10 bg-black/60">
        <h2 className="text-xl sm:text-2xl font-bold">PesScore</h2>
        <Link
          to="/"
          className="bg-white/20 hover:bg-white/40 text-white font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition text-sm sm:text-base"
        >
          Go Home
        </Link>
      </header>

      <main className="flex flex-col items-center w-full px-3 sm:px-4 md:px-5 pt-20 pb-8 sm:pb-10">
        <section className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg text-center max-w-xl w-full backdrop-blur-sm">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-700 mb-4">404 - Page Not Found</h1>
          <p className="text-gray-800 text-base sm:text-lg leading-relaxed mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            to="/"
            className="bg-blue-700 hover:bg-blue-900 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            Return to Home
          </Link>
        </section>
      </main>

      <footer className="bg-gradient-to-r from-blue-800 to-blue-700 text-white w-full text-center py-4 mt-auto text-sm backdrop-blur-sm">
        PesScore © 2025 - Football Match Tracker
      </footer>
    </div>
  );
}
