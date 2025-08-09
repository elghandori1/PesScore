import { Link } from "react-router-dom";

const AccountId = () => {
    return(
        <main className="flex flex-col mt-2 items-center w-full px-3 sm:px-6 pb-10" dir="rtl">
  <div className="container mx-auto max-w-md pt-4 sm:pt-6">
    <div className="rounded-lg shadow overflow-hidden bg-white p-5 sm:p-8">
      <h4 className="text-xl font-bold text-center text-red-600 mb-1">
        ما هو معرف الحساب ID؟
      </h4>

      <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
        معرف الحساب (ID) هو معرفك الفريد الذي يميز حسابك داخل اللعبة.
        يظهر هذا المعرف عادةً على الشاشة الرئيسية أو في ملفك الشخصي داخل اللعبة
      </p>

      <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
        يتبع هذا المعرف تنسيقًا محددًا لضمان فرادته وسهولة التعرف عليه.
        يتكون من الأجزاء التالية:
      </p>

      <ul className="list-disc list-inside text-sm sm:text-base text-gray-700 mb-4 space-y-2">
        <li>
          <span className="font-semibold">4 أحرف كبيرة:</span> تبدأ بها المعرف.
          مثال: <span className="font-mono text-blue-600">ABCD</span>
        </li>
        <li>
          <span className="font-semibold">شرطة (-):</span> تفصل بين الأحرف والأرقام.
        </li>
        <li>
          <span className="font-semibold">3 مجموعات من 3 أرقام:</span> كل مجموعة مكونة من ثلاثة أرقام.
          مثال: <span className="font-mono text-blue-600">123-456-789</span>
        </li>
      </ul>

      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
        <span className="font-bold text-base sm:text-md text-green-700">مثال على معرف حساب صحيح:</span>{' '}
        <p className="font-mono text-lg sm:text-md text-green-700 bg-green-50 px-2 py-1 rounded-md">ABCD-123-456-789</p>
      </p>

      <div className="text-center mt-4 sm:mt-6">
        <Link
          to="/register"
          className="inline-block bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm sm:text-base"
        >
          العودة إلى صفحة التسجيل
        </Link>
      </div>
    </div>
  </div>
</main>

    )
}
export default AccountId