import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Message from "../components/Message";
import axiosClient from "../api/axiosClient";
import {useMessage} from '../hooks/useMessage';

const Register = () => {
  const [nameAccount, setNameAccount] = useState("");
  const [idAccount, setIdAccount] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { showMessage, clearMessage } = useMessage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessage();

    if (password !== confirmPassword) {
      return showMessage("كلمة المرور غير متطابقة",'error');
    }

    try {
      await axiosClient.post("/auth/register", {
        name_account: nameAccount,
        id_account: idAccount,
        email,
        password,
      });
      navigate("/login");
    } catch (error) {
      showMessage(error.response?.data?.message || "Register failed",'error');
    }
  };

  return (
    <main className="px-2 xs:px-3 sm:px-4 py-4" dir="rtl">
      <section className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
        <div className="text-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-blue-700 mb-1">
            إنشاء حساب
          </h2>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="nameAccount"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              اسم الحساب
            </label>
            <input
              type="text"
              id="nameAccount"
              name="nameAccount"
              placeholder="أدخل اسم حسابك"
              value={nameAccount}
              onChange={(e) => setNameAccount(e.target.value)}
              required
              className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="idAccount"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              معرف اللعبة ID
            </label>
            <input
              type="text"
              id="idAccount"
              name="idAccount"
              placeholder="أدخل معرف اللعبة الخاص بك"
              value={idAccount}
              maxLength={16}
              onChange={(e) => setIdAccount(e.target.value)}
              required
              className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              البريد الإلكتروني
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="أدخل بريدك الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              كلمة المرور
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="أدخل كلمة المرور (8 أحرف على الأقل)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="8"
              required
              className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              تأكيد كلمة المرور
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="تأكيد كلمة المرور"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition text-sm"
          >
            تسجيل
          </button>
        </form>

        <p className="mt-4 text-center text-xs sm:text-sm text-gray-600">
          لديك حساب بالفعل؟{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Register;
