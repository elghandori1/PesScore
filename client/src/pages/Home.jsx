import { Link } from "react-router-dom";
import useAuth from "../auth/useAuth";
import {useMessage} from '../hooks/useMessage';

const Home = () => {
  const { user } = useAuth();
  const { clearMessage } = useMessage();
  clearMessage();
  if (!user) return null;

  return (
    <main className="flex flex-col items-center w-full px-2 xs:px-3 sm:px-6 md:px-8 pt-16 xs:pt-20 sm:pt-24 pb-12 xs:pb-16">
     
      {/* Description Section */}
      <section className="bg-white/90 mt-3 xs:mt-4 sm:mt-6 p-3 xs:p-4 sm:p-6 md:p-8 rounded-lg xs:rounded-xl shadow-lg text-center w-full max-w-xl mx-auto backdrop-blur-sm">
        <h2 className="text-lg xs:text-xl sm:text-2xl mb-2 text-blue-600 font-semibold">
          PesScore
        </h2>
        <p className="text-gray-800 text-sm xs:text-base sm:text-lg leading-relaxed font-almarai" dir="ltr">
          مرحبًا بك في PesScore، حيث يمكنك إدارة المباريات بين أصدقائك بسهولة. يمكنك إضافة أصدقاء جدد، عرض قائمة الأصدقاء، وإدارة طلبات الصداقة. ابدأ الآن واستمتع بتجربة التواصل مع أصدقائك!
        </p>
      </section>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:gap-4 md:gap-6 max-w-xl w-full mt-4 sm:mt-6">
        <Link
          to="/add-friend"
          className="bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 transform hover:scale-105 transition text-white p-3 xs:p-4 sm:p-5 rounded-lg xs:rounded-xl text-center flex flex-col items-center shadow-md hover:shadow-lg backdrop-blur-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 xs:h-8 sm:h-10 md:h-12 w-6 xs:w-8 sm:w-10 md:w-12 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span className="text-xs xs:text-sm sm:text-base md:text-lg font-almarai">
            إضافة صديق
          </span>
        </Link>

        <Link
          to="/list-friend"
          className="bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 transform hover:scale-105 transition text-white p-3 xs:p-4 sm:p-5 rounded-lg xs:rounded-xl text-center flex flex-col items-center shadow-md hover:shadow-lg backdrop-blur-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 xs:h-8 sm:h-10 md:h-12 w-6 xs:w-8 sm:w-10 md:w-12 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span className="text-xs xs:text-sm sm:text-base md:text-lg font-almarai">
            قائمة الأصدقاء
          </span>
        </Link>
      </div>
    </main>
  );
};

export default Home;