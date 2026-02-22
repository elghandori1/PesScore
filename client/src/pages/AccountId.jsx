import { Link } from "react-router-dom";
import { useState } from "react";
import Imageaccount from "../assets/images/account-id.png";

const AccountId = () => {
  const [showImage, setShowImage] = useState(false);

  return (
    <main 
      className="flex flex-col mt-2 items-center w-full px-3 sm:px-4 pb-8 sm:pb-10 min-h-screen" 
      dir="rtl"
    >
      <div className="container mx-auto w-full max-w-md pt-3 sm:pt-5">
        
        <div className="rounded-xl shadow-lg overflow-hidden bg-white p-4 sm:p-6 relative">
          {/* Close Button - Improved touch target for mobile */}
      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 md:top-4 md:left-4 z-10">
            <Link
              to="/register"
              className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-red-100 hover:bg-red-200 rounded-full text-red-600 hover:text-red-800 transition-all duration-200 shadow-sm hover:shadow"
              title="عودة للتسجيل"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </div>

          <h4 className="text-base sm:text-lg font-bold text-center text-blue-700 mb-3 sm:mb-4 px-2">
            ما هو معرف الحساب ID؟
          </h4>

          <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4 text-center sm:text-start">
            معرف الحساب (ID) هو معرفك الفريد الذي يميز حسابك داخل اللعبة.
            يظهر هذا المعرف عادةً على الشاشة الرئيسية أو في ملفك الشخصي داخل اللعبة
          </p>

          {/* Image with better mobile handling */}
          <div className="mb-5 text-center">
            <div 
              className="relative inline-block border border-gray-200 rounded-xl overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-[0.98] w-full max-w-sm mx-auto"
              onClick={() => setShowImage(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setShowImage(true)}
              aria-label="اضغط لتكبير الصورة التوضيحية"
            >
              <img
                src={Imageaccount}
                alt="صورة توضيحية لمكان معرف الحساب في اللعبة"
                className="w-full h-auto max-h-64 object-contain bg-gray-50"
                loading="lazy"
              />
              {/* Visual hint overlay for mobile */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                  🔍 اضغط للتكبير
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 px-2">
              * اضغط على الصورة لتكبيرها
            </p>
          </div>

          <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3 text-center sm:text-start">
            يتبع هذا المعرف تنسيقًا محددًا لضمان فرادته وسهولة التعرف عليه.
            يتكون من الأجزاء التالية:
          </p>

          <ul className="list-disc list-inside text-sm sm:text-base text-gray-700 mb-4 space-y-2 pr-1">
            <li className="flex flex-wrap gap-x-1">
              <span className="font-semibold whitespace-nowrap">4 أحرف كبيرة:</span>
              <span>تبدأ بها المعرف. مثال:</span>
              <span className="font-mono text-blue-600 break-all">ABCD</span>
            </li>
            <li className="flex flex-wrap gap-x-1">
              <span className="font-semibold whitespace-nowrap">شرطة (-):</span>
              <span>تفصل بين الأحرف والأرقام.</span>
            </li>
            <li className="flex flex-wrap gap-x-1">
              <span className="font-semibold whitespace-nowrap">3 مجموعات من 3 أرقام:</span>
              <span>كل مجموعة مكونة من ثلاثة أرقام. مثال:</span>
              <span className="font-mono text-blue-600 break-all">123-456-789</span>
            </li>
          </ul>

          <div className="text-center mb-3">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              <span className="font-bold text-green-700">مثال على معرف حساب صحيح:</span>
            </p>
            <p className="font-mono text-base sm:text-lg text-green-700 bg-green-50 px-3 py-2 rounded-lg mt-2 break-all whitespace-normal">
              ABCD-123-456-789
            </p>
          </div>
          
 <div className="mt-4 p-3 sm:p-4 bg-blue-50 border-s-4 border-blue-500 text-blue-800 text-sm rounded-lg">
  <p className="leading-relaxed">
    يمكنك أيضاً رؤية معرف الحساب (ID) من داخل اللعبة عبر الذهاب إلى
    <span className="font-bold mx-1">"إضافات"</span>
    <span className="mx-1">←</span>
    <span className="font-bold mx-1">"معلومات المستخدم الشخصية"</span>
  </p>
</div>
        </div>
      </div>

      {/* Improved Modal for Mobile */}
      {showImage && (
        <div 
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-3 sm:p-4"
          onClick={() => setShowImage(false)}
          role="dialog"
          aria-modal="true"
          aria-label="صورة مكبرة لمعرف الحساب"
        >
          <div 
            className="relative w-full max-w-full sm:max-w-4xl max-h-[85vh] sm:max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button - larger touch target, positioned for easy mobile access */}
            <button
              onClick={() => setShowImage(false)}
              className="absolute -top-10 sm:top-3 start-0 sm:start-auto sm:end-3 text-white bg-black/60 hover:bg-black/80 rounded-full w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center transition-all active:scale-95 z-10 shadow-lg"
              aria-label="إغلاق الصورة المكبرة"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image container with proper scaling */}
            <div className="flex-1 flex items-center justify-center bg-black/20 rounded-xl overflow-hidden">
              <img
                src={Imageaccount}
                alt="صورة توضيحية مكبرة لمعرف الحساب"
                className="w-full h-full max-h-[75vh] sm:max-h-[80vh] object-contain"
              />
            </div>
            
            {/* Mobile-friendly instruction */}
            <p className="text-white/90 text-center mt-3 text-sm px-4">
              اضغط خارج الصورة أو على ✕ للإغلاق
            </p>
          </div>
        </div>
      )}
    </main>
  );
};

export default AccountId;