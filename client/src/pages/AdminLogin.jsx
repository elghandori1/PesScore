import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useMessage } from "../hooks/useMessage";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adminExists, setAdminExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const { showMessage, clearMessage } = useMessage();

  useEffect(() => {
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      const response = await axiosClient.get("/admin/check-exists");
      setAdminExists(response.data.adminExists);
      setLoading(false);
    } catch (error) {
      console.error("Error checking admin exists:", error);
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessage();

    if (!username || !password) {
      showMessage("يجب ملء جميع الحقول", "error");
      return;
    }

    setIsLoggingIn(true);

    try {
      const response = await axiosClient.post("/admin/login", {
        username: username.trim(),
        password: password.trim(),
      });

      localStorage.setItem("adminToken", response.data.token);
      showMessage("تم تسجيل الدخول بنجاح", "success");
      setTimeout(() => {
        navigate("/admin-dashboard");
      }, 1000);
    } catch (error) {
      showMessage(
        error.response?.data?.message || "خطأ في تسجيل الدخول",
        "error"
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterAdmin = async (e) => {
    e.preventDefault();
    clearMessage();

    if (!username || !password) {
      showMessage("يجب ملء جميع الحقول", "error");
      return;
    }

    setIsLoggingIn(true);

    try {
      await axiosClient.post("/admin/register", {
        username: username.trim(),
        password: password.trim(),
      });

      showMessage("تم إنشاء حساب الإدارة بنجاح", "success");
      setTimeout(() => {
        setAdminExists(true);
        setUsername("");
        setPassword("");
      }, 1000);
    } catch (error) {
      showMessage(
        error.response?.data?.message || "خطأ في إنشاء الحساب",
        "error"
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600">لوحة التحكم</h1>
          <p className="text-gray-600 mt-2">إدارة الموقع</p>
        </div>

        {!adminExists ? (
          <form onSubmit={handleRegisterAdmin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المستخدم
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300 disabled:opacity-50"
            >
              {isLoggingIn ? "جاري الإنشاء..." : "إنشاء حساب إدارة"}
            </button>

            <p className="text-center text-gray-600 text-sm">
              هذا هو أول تسجيل دخول للإدارة
            </p>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المستخدم
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300 disabled:opacity-50"
            >
              {isLoggingIn ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
