import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import useAuth from "../auth/useAuth";
import {useMessage} from '../hooks/useMessage';

const Login = () => {
  const [idAccount, setIdAccount] = useState("");
  const [password, setPassword] = useState("");
  const { setUser, setJustLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { showMessage, clearMessage } = useMessage();

  const [isProcessing, setIsProcessing] = useState(false);

  const handleIdChange = (e) => {
    const value = e.target.value.toUpperCase();
    setIdAccount(value);

    // Match exactly: 4 letters + 9 digits (total 13 chars)
    const pattern = /^[A-Z]{4}[0-9]{9}$/;

    if (pattern.test(value)) {
      setIsProcessing(true);

      setTimeout(() => {
        const formatted = `${value.slice(0, 4)}-${value.slice(
          4,
          7
        )}-${value.slice(7, 10)}-${value.slice(10, 13)}`;
        setIdAccount(formatted);

        setIsProcessing(false);
      }, 300);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
   clearMessage();
    try {
      const response = await axiosClient.post("/auth/login", {
        id_account: idAccount.trim(),
        password: password.trim(),
      });
     localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setJustLoggedIn(true);
      navigate("/");
    } catch (error) {
      showMessage(error.response?.data?.message || "Login failed",'error');
    }
  };

  return (
    <main className="px-2 xs:px-3 sm:px-4 py-2 mt-6" dir="rtl">
      <section className="bg-white p-4 sm:p-5 md:p-10 rounded-lg shadow-md w-full max-w-md mx-auto">
        <div className="text-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-blue-700 mb-1">
            تسجيل الدخول
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm">
            الوصول إلى حساب متتبع المباريات
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="idAccount"
              className="block mb-2 font-medium text-gray-700 text-xs sm:text-sm"
            >
              معرف اللعبة ID
            </label>
             <input
              type="text"
              id="idAccount"
              name="idAccount"
              placeholder="ID أدخل معرف اللعبة الخاص بك"
              value={idAccount}
              onChange={handleIdChange}
              readOnly={isProcessing}
              required
              className={`w-full p-2 sm:p-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm 
                ${isProcessing ? "bg-green-100" : "border-gray-300"}`}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-2 font-medium text-gray-700 text-xs sm:text-sm"
            >
              كلمة المرور
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium px-4 py-2 rounded-md shadow-sm hover:shadow-md transition-all duration-200 hover:from-blue-700 hover:to-blue-600 text-sm"
          >
            تسجيل الدخول
          </button>
        </form>

        <div className="mt-4 text-center text-xs sm:text-sm text-gray-600">
          ليس لديك حساب؟{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition"
          >
            التسجيل
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Login;
