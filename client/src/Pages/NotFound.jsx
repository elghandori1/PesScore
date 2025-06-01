import { Link } from "react-router-dom";
import footballBg from "../assets/images/efootbalBG5.png";

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

      {/* Header */}
      <header className="w-full flex flex-row justify-between items-center px-2 py-2 sm:px-4 sm:py-3 text-white fixed z-30 bg-black/70 backdrop-blur-sm">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">PesScore</h2>
        <Link
          to="/"
          className="font-almarai bg-white/20 hover:bg-white/40 text-white font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition text-xs sm:text-sm md:text-base flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          العودة إلى الرئيسية
        </Link>
      </header>

      <main className="flex flex-col items-center w-full px-3 sm:px-4 md:px-5 pt-20 pb-8 sm:pb-10">
        <section className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg text-center max-w-xl w-full backdrop-blur-sm">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-700 mb-4 font-almarai">
            404 - الصفحة غير موجودة
          </h1>
          <p className="text-gray-800 text-base sm:text-lg leading-relaxed mb-6 font-almarai">
            الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها.
          </p>
          <Link
            to="/"
            className="bg-blue-700 hover:bg-blue-900 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            العودة إلى الرئيسية
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white py-2 text-xs xs:text-sm z-10 shadow-lg">
        <div className="container mx-auto px-4 text-center font-almarai">
          <p className="mb-0.5 font-medium">PesScore © {new Date().getFullYear()}</p>
          <p className="text-gray-200">
            تم التطوير بواسطة <span dir="ltr">Mohammed elghandori</span>. للاقتراحات أو المشاكل،{" "}
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
